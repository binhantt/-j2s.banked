package com.example.bankend_hovan_J2.infrastructure.oauth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifier.class);

    @Value("${google.client-id}")
    private String clientId;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        System.out.println("🚀🚀🚀 CLIENT_ID FROM application.yml: [" + clientId + "] 🔥🔥🔥");
        System.out.println("🚀🚀🚀 CLIENT_ID length: " + (clientId != null ? clientId.length() : 0));
        log.info("[GoogleTokenVerifier] ✅ Initialized with clientId: {}", clientId);
        log.info("[GoogleTokenVerifier] clientId length: {}", clientId != null ? clientId.length() : 0);
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
        .setAudience(Collections.singletonList(clientId))
        .build();
    }

    /**
     * Decode JWT payload (base64url, WITHOUT signature verification)
     * để debug xem token có đúng format không, expired chưa, aud có khớp không.
     * ⚠️ Chỉ dùng để DEBUG — KHÔNG dùng cho authentication thật.
     */
    private void debugDecodeJwtPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                log.warn("[GoogleTokenVerifier] ⚠️ JWT format incorrect — parts count: {}", parts.length);
                return;
            }

            // Decode payload (part 1 = header, 2 = payload, 3 = signature)
            String payloadJson = new String(
                Base64.getUrlDecoder().decode(parts[1]),
                StandardCharsets.UTF_8
            );
            log.info("[GoogleTokenVerifier] 🔓 [DEBUG] Raw JWT payload (unverified): {}", payloadJson);

            // Parse ra key fields để log
            com.google.gson.JsonObject payload = new com.google.gson.JsonParser().parse(payloadJson).getAsJsonObject();

            String aud = payload.has("aud") ? payload.get("aud").getAsString() : "MISSING";
            String iss = payload.has("iss") ? payload.get("iss").getAsString() : "MISSING";
            long exp = payload.has("exp") ? payload.get("exp").getAsLong() : 0;
            long iat = payload.has("iat") ? payload.get("iat").getAsLong() : 0;
            String email = payload.has("email") ? payload.get("email").getAsString() : "MISSING";
            String sub = payload.has("sub") ? payload.get("sub").getAsString() : "MISSING";

            long nowSec = System.currentTimeMillis() / 1000;
            log.info("[GoogleTokenVerifier] 🔓 [DEBUG] JWT claims (unverified):");
            log.info("[GoogleTokenVerifier]   aud  = {} (configured clientId = {})", aud, clientId);
            log.info("[GoogleTokenVerifier]   aud MATCHES clientId: {}", aud.equals(clientId));
            log.info("[GoogleTokenVerifier]   iss  = {} (expected: accounts.google.com OR https://accounts.google.com)", iss);
            log.info("[GoogleTokenVerifier]   iss VALID: {}", iss.equals("accounts.google.com") || iss.equals("https://accounts.google.com"));
            log.info("[GoogleTokenVerifier]   exp  = {} (now={}, expired={})", exp, nowSec, (exp > 0 && exp < nowSec));
            log.info("[GoogleTokenVerifier]   iat  = {}", iat);
            log.info("[GoogleTokenVerifier]   email= {}", email);
            log.info("[GoogleTokenVerifier]   sub  = {}", sub);

        } catch (Exception e) {
            log.warn("[GoogleTokenVerifier] ⚠️ Could not debug-decode JWT: {} — {}", e.getClass().getSimpleName(), e.getMessage());
        }
    }

    public GoogleIdToken.Payload verify(String idTokenString) {
        log.info("[GoogleTokenVerifier] 🔍 verify() called");
        log.info("[GoogleTokenVerifier] idTokenString is null: {}", idTokenString == null);
        if (idTokenString != null) {
            log.info("[GoogleTokenVerifier] idTokenString length: {}", idTokenString.length());
            // Print first 80 chars to identify token type
            String preview = idTokenString.substring(0, Math.min(80, idTokenString.length()));
            log.info("[GoogleTokenVerifier] idTokenString prefix (first 80): {}", preview);
            // Detect if this looks like an access token (starts with "ya29.") vs id_token (starts with "eyJ")
            if (idTokenString.startsWith("ya29.")) {
                log.error("[GoogleTokenVerifier] 🚨 THIS IS AN ACCESS TOKEN, NOT AN ID TOKEN! idTokens start with 'eyJ'");
            } else if (idTokenString.startsWith("eyJ")) {
                log.info("[GoogleTokenVerifier] ✅ Token format looks like an id_token (starts with 'eyJ')");
            } else {
                log.warn("[GoogleTokenVerifier] ⚠️ Unknown token format — id_tokens should start with 'eyJ'");
            }
            // Decode JWT payload for debugging (before verification)
            debugDecodeJwtPayload(idTokenString);
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                log.info("[GoogleTokenVerifier] ✅ Token VERIFIED successfully");
                log.info("[GoogleTokenVerifier]   email: {}", payload.getEmail());
                log.info("[GoogleTokenVerifier]   subject (googleId): {}", payload.getSubject());
                log.info("[GoogleTokenVerifier]   name: {}", payload.get("name"));
                log.info("[GoogleTokenVerifier]   audience: {}", payload.getAudience());
                log.info("[GoogleTokenVerifier]   issuer: {}", payload.getIssuer());
                return payload;
            }

            log.error("[GoogleTokenVerifier] ❌ verifier.verify() returned null — LIKELY CAUSES:");
            log.error("[GoogleTokenVerifier]   1. Wrong token type sent — frontend may be sending access_token instead of id_token");
            log.error("[GoogleTokenVerifier]   2. Token audience (aud) does NOT match google.client-id in application.yml");
            log.error("[GoogleTokenVerifier]   3. Token is expired");
            log.error("[GoogleTokenVerifier]   4. Token issuer (iss) is not accounts.google.com");
            log.error("[GoogleTokenVerifier]   5. Token was issued for a DIFFERENT client ID (check Google Cloud Console)");
            log.error("[GoogleTokenVerifier]   6. Using localhost/http in Google Console but sending from different origin");

            // Last resort: try to decode without verification to show what's in the token
            log.info("[GoogleTokenVerifier] 🔍 Attempting manual decode (no signature check)...");
            GoogleIdToken manualParsed = GoogleIdToken.parse(
                new com.google.api.client.json.gson.GsonFactory(), idTokenString);
            if (manualParsed != null && manualParsed.getPayload() != null) {
                GoogleIdToken.Payload p = manualParsed.getPayload();
                log.warn("[GoogleTokenVerifier] ⚠️ Token PARSED (but NOT verified) — aud='{}', iss='{}', exp={}, email='{}'",
                        p.getAudience(), p.getIssuer(), p.getExpirationTimeSeconds(),
                        p.getEmail());
                log.warn("[GoogleTokenVerifier] ⚠️ If aud does NOT match '{}', this is the root cause!", clientId);
            }

            throw new RuntimeException("Invalid Google token — check server logs above for root cause");
        } catch (RuntimeException e) {
            log.error("[GoogleTokenVerifier] ❌ RuntimeException: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("[GoogleTokenVerifier] ❌ Exception during verify: {} — {}", e.getClass().getSimpleName(), e.getMessage());
            throw new RuntimeException("Failed to verify Google token", e);
        }
    }
}
