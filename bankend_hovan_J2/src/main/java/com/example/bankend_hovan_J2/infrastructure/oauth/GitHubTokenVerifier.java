package com.example.bankend_hovan_J2.infrastructure.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class GitHubTokenVerifier {

    private static final Logger logger = LoggerFactory.getLogger(GitHubTokenVerifier.class);

    @Value("${github.client-id}")
    private String clientId;

    @Value("${github.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GitHubUserInfo verify(String code) {
        try {
            logger.info("Starting GitHub OAuth verification with code: {}", code.substring(0, Math.min(10, code.length())) + "...");
            
            // Validate configuration
            if (clientId == null || clientId.contains("your-github-client-id")) {
                throw new RuntimeException("GitHub Client ID not configured. Please set github.client-id in application.yml");
            }
            if (clientSecret == null || clientSecret.contains("your-github-client-secret")) {
                throw new RuntimeException("GitHub Client Secret not configured. Please set github.client-secret in application.yml");
            }
            
            // Exchange code for access token
            String accessToken = exchangeCodeForToken(code);
            logger.info("Successfully obtained GitHub access token");
            
            // Get user info with access token
            GitHubUserInfo userInfo = getUserInfo(accessToken);
            logger.info("Successfully retrieved GitHub user info for: {}", userInfo.getLogin());
            
            return userInfo;
        } catch (Exception e) {
            logger.error("GitHub token verification failed: {}", e.getMessage(), e);
            throw new RuntimeException("GitHub login failed: " + e.getMessage(), e);
        }
    }

    private String exchangeCodeForToken(String code) throws Exception {
        String url = "https://github.com/login/oauth/access_token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        String requestBody = String.format(
            "{\"client_id\":\"%s\",\"client_secret\":\"%s\",\"code\":\"%s\"}",
            clientId, clientSecret, code
        );

        logger.debug("Exchanging code for token with GitHub");
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            // Check for error in response
            if (jsonNode.has("error")) {
                String error = jsonNode.get("error").asText();
                String errorDescription = jsonNode.has("error_description") 
                    ? jsonNode.get("error_description").asText() 
                    : "Unknown error";
                throw new RuntimeException("GitHub OAuth error: " + error + " - " + errorDescription);
            }
            
            if (!jsonNode.has("access_token")) {
                throw new RuntimeException("No access_token in GitHub response");
            }
            
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            logger.error("Failed to exchange code for token: {}", e.getMessage());
            throw e;
        }
    }

    private GitHubUserInfo getUserInfo(String accessToken) throws Exception {
        String url = "https://api.github.com/user";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Accept", "application/json");

        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            GitHubUserInfo userInfo = new GitHubUserInfo();
            userInfo.setId(jsonNode.get("id").asText());
            userInfo.setLogin(jsonNode.get("login").asText());
            userInfo.setName(jsonNode.has("name") && !jsonNode.get("name").isNull() 
                ? jsonNode.get("name").asText() 
                : jsonNode.get("login").asText());
            
            // Get email from user endpoint or use login@github.com
            String email = null;
            if (jsonNode.has("email") && !jsonNode.get("email").isNull()) {
                email = jsonNode.get("email").asText();
            }
            
            // If email is null, try to get from emails endpoint
            if (email == null || email.isEmpty()) {
                email = getPrimaryEmail(accessToken);
            }
            
            // Fallback to login@github.com
            if (email == null || email.isEmpty()) {
                email = jsonNode.get("login").asText() + "@github.com";
            }
            
            userInfo.setEmail(email);
            userInfo.setAvatarUrl(jsonNode.get("avatar_url").asText());
            
            return userInfo;
        } catch (Exception e) {
            logger.error("Failed to get user info: {}", e.getMessage());
            throw e;
        }
    }

    private String getPrimaryEmail(String accessToken) {
        try {
            String url = "https://api.github.com/user/emails";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Accept", "application/json");

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            
            JsonNode emails = objectMapper.readTree(response.getBody());
            for (JsonNode emailNode : emails) {
                if (emailNode.get("primary").asBoolean() && emailNode.get("verified").asBoolean()) {
                    return emailNode.get("email").asText();
                }
            }
        } catch (Exception e) {
            logger.warn("Could not fetch GitHub emails: {}", e.getMessage());
        }
        return null;
    }

    public static class GitHubUserInfo {
        private String id;
        private String login;
        private String name;
        private String email;
        private String avatarUrl;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
