package com.example.bankend_hovan_J2.infrastructure.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Verifies Google Identity Services (GIS) One Tap "credential" tokens.
 * The frontend sends a Base64-encoded JWT (not an OAuth 2.0 id_token).
 * Verification uses Google's JWKS endpoint for RS256 signature validation.
 */
@Component
public class GoogleTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifier.class);
    private static final String GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String ISSUER = "https://accounts.google.com";

    @Value("${google.client-id}")
    private String clientId;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    /** In-memory JWKS cache */
    private volatile Map<String, PublicKey> jwksCache = new ConcurrentHashMap<>();
    private volatile long jwksCacheTime = 0;
    private static final long JWKS_CACHE_TTL_MS = 3_600_000; // 1 hour

    /** Return type holding all payload fields needed by GoogleLoginUseCase */
    public record GooglePayload(
            String subject,
            String email,
            String name,
            String picture
    ) {}

    public GoogleTokenVerifier() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        log.info("[GoogleTokenVerifier] ✅ Initialized with clientId: {}", clientId);
    }

    /**
     * Verifies a GIS One Tap "credential" JWT:
     * 1. Decode header (Base64) → extract kid
     * 2. Validate iss / aud (no exp check)
     * 3. Fetch / cache JWKS from Google → get PublicKey for kid
     * 4. Verify RS256 signature manually
     */
    public GooglePayload verify(String credential) {
        if (credential == null || credential.isBlank()) {
            log.error("[GoogleTokenVerifier] ❌ Credential is null or blank");
            throw new RuntimeException("Google credential is required.");
        }

        String[] parts = credential.split("\\.");
        if (parts.length != 3) {
            log.error("[GoogleTokenVerifier] ❌ Malformed JWT — expected 3 parts, got {}", parts.length);
            throw new RuntimeException("Invalid Google token. Please re-login via Google.");
        }

        try {
            // Step 1: Decode header & payload (Base64 URL — no signature verification yet)
            String headerJson  = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode headerNode = objectMapper.readTree(headerJson);
            JsonNode payloadNode = objectMapper.readTree(payloadJson);

            String kid = headerNode.has("kid") ? headerNode.get("kid").asText() : null;
            log.debug("[GoogleTokenVerifier] 🔑 kid: {}", kid);

            // Step 2: Validate iss / aud before fetching key (cheap checks first)
            String iss = payloadNode.has("iss") ? payloadNode.get("iss").asText() : null;
            if (iss == null || (!iss.equals(ISSUER) && !iss.equals("accounts.google.com"))) {
                log.error("[GoogleTokenVerifier] ❌ Invalid ISS — expected '{}', got '{}'", ISSUER, iss);
                throw new RuntimeException("Invalid Google token. Please re-login via Google.");
            }

            String aud = payloadNode.has("aud") ? payloadNode.get("aud").asText() : null;
            if (aud == null || !aud.equals(clientId)) {
                log.error("[GoogleTokenVerifier] ❌ Invalid AUD — expected '{}', got '{}'", clientId, aud);
                throw new RuntimeException("Invalid Google token. Please re-login via Google.");
            }

            // Step 3: Fetch public key from JWKS
            PublicKey publicKey = getPublicKey(kid);

            // Step 4: Verify RS256 signature manually (bypass exp check of JJWT)
            String signatureInput = parts[0] + "." + parts[1];
            byte[] signatureBytes = Base64.getUrlDecoder().decode(parts[2]);

            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(publicKey);
            sig.update(signatureInput.getBytes(StandardCharsets.UTF_8));
            if (!sig.verify(signatureBytes)) {
                log.error("[GoogleTokenVerifier] ❌ Invalid SIGNATURE");
                throw new RuntimeException("Invalid Google token. Please re-login via Google.");
            }

            // Step 5: Extract claims from decoded payload (no exp check)
            JsonNode claimsNode = objectMapper.readTree(payloadJson);
            String subject  = claimsNode.has("sub")      ? claimsNode.get("sub").asText()      : null;
            String email   = claimsNode.has("email")     ? claimsNode.get("email").asText()     : null;
            String name    = claimsNode.has("name")      ? claimsNode.get("name").asText()      : null;
            String picture = claimsNode.has("picture")    ? claimsNode.get("picture").asText()  : null;

            log.info("[GoogleTokenVerifier] ✅ Token verified — email: {}", email);
            return new GooglePayload(subject, email, name, picture);

        } catch (SecurityException e) {
            log.error("[GoogleTokenVerifier] ❌ Invalid SIGNATURE — {}", e.getMessage());
            throw new RuntimeException("Invalid Google token. Please re-login via Google.");
        } catch (RuntimeException e) {
            log.error("[GoogleTokenVerifier] ❌ RuntimeException: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("[GoogleTokenVerifier] ❌ Unexpected error: {} — {}",
                    e.getClass().getSimpleName(), e.getMessage());
            throw new RuntimeException("Failed to verify Google token.", e);
        }
    }

    // ─── JWKS helpers ───────────────────────────────────────────────────────

    private PublicKey getPublicKey(String kid) throws Exception {
        refreshJwksIfNeeded();

        PublicKey key = jwksCache.get(kid);
        if (key != null) {
            return key;
        }

        // Not in cache — might be a fresh rotation; force refresh
        refreshJwks();
        key = jwksCache.get(kid);
        if (key != null) {
            return key;
        }

        log.error("[GoogleTokenVerifier] ❌ kid '{}' not found in JWKS", kid);
        throw new RuntimeException("Invalid Google token. Please re-login via Google.");
    }

    private void refreshJwksIfNeeded() {
        if (System.currentTimeMillis() - jwksCacheTime < JWKS_CACHE_TTL_MS && !jwksCache.isEmpty()) {
            return;
        }
        refreshJwks();
    }

    private synchronized void refreshJwks() {
        // Double-check after acquiring lock
        if (System.currentTimeMillis() - jwksCacheTime < JWKS_CACHE_TTL_MS && !jwksCache.isEmpty()) {
            return;
        }

        try {
            log.info("[GoogleTokenVerifier] 🌐 Fetching JWKS from {}", GOOGLE_JWKS_URL);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_JWKS_URL))
                    .header("Accept", "application/json")
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("[GoogleTokenVerifier] ❌ JWKS fetch failed — HTTP {}", response.statusCode());
                throw new RuntimeException("Failed to fetch Google JWKS.");
            }

            JsonNode keys = objectMapper.readTree(response.body()).get("keys");
            if (keys == null || !keys.isArray()) {
                log.error("[GoogleTokenVerifier] ❌ JWKS response has no 'keys' array");
                throw new RuntimeException("Invalid JWKS response from Google.");
            }

            Map<String, PublicKey> newCache = new ConcurrentHashMap<>();
            for (JsonNode keyNode : keys) {
                String keyId = keyNode.get("kid").asText();
                PublicKey publicKey = parseRSAPublicKey(keyNode);
                newCache.put(keyId, publicKey);
            }

            this.jwksCache = newCache;
            this.jwksCacheTime = System.currentTimeMillis();
            log.info("[GoogleTokenVerifier] ✅ JWKS cached — {} keys loaded", newCache.size());

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("[GoogleTokenVerifier] ❌ Error refreshing JWKS: {}", e.getMessage());
            throw new RuntimeException("Failed to refresh Google signing keys.", e);
        }
    }

    private PublicKey parseRSAPublicKey(JsonNode jwkNode) throws Exception {
        String nStr = jwkNode.get("n").asText();
        String eStr = jwkNode.get("e").asText();

        BigInteger n = new BigInteger(1, Base64.getUrlDecoder().decode(nStr));
        BigInteger e = new BigInteger(1, Base64.getUrlDecoder().decode(eStr));

        RSAPublicKeySpec spec = new RSAPublicKeySpec(n, e);
        return java.security.KeyFactory.getInstance("RSA").generatePublic(spec);
    }
}
