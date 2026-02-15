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
public class FacebookTokenVerifier {

    private static final Logger logger = LoggerFactory.getLogger(FacebookTokenVerifier.class);

    @Value("${facebook.app-id}")
    private String appId;

    @Value("${facebook.app-secret}")
    private String appSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FacebookUserInfo verify(String accessToken) {
        try {
            logger.info("Starting Facebook OAuth verification");
            
            if (appId == null || appId.contains("your-facebook-app-id")) {
                throw new RuntimeException("Facebook App ID not configured");
            }
            if (appSecret == null || appSecret.contains("your-facebook-app-secret")) {
                throw new RuntimeException("Facebook App Secret not configured");
            }
            
            // Verify token and get user info
            FacebookUserInfo userInfo = getUserInfo(accessToken);
            logger.info("Successfully retrieved Facebook user info for: {}", userInfo.getName());
            
            return userInfo;
        } catch (Exception e) {
            logger.error("Facebook token verification failed: {}", e.getMessage(), e);
            throw new RuntimeException("Facebook login failed: " + e.getMessage(), e);
        }
    }

    private FacebookUserInfo getUserInfo(String accessToken) throws Exception {
        String url = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + accessToken;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");

        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            FacebookUserInfo userInfo = new FacebookUserInfo();
            userInfo.setId(jsonNode.get("id").asText());
            userInfo.setName(jsonNode.get("name").asText());
            
            // Email might not be available if user didn't grant permission
            String email = null;
            if (jsonNode.has("email") && !jsonNode.get("email").isNull()) {
                email = jsonNode.get("email").asText();
            } else {
                // Use Facebook ID as email fallback
                email = jsonNode.get("id").asText() + "@facebook.com";
            }
            userInfo.setEmail(email);
            
            // Get profile picture
            if (jsonNode.has("picture") && jsonNode.get("picture").has("data")) {
                JsonNode pictureData = jsonNode.get("picture").get("data");
                if (pictureData.has("url")) {
                    userInfo.setAvatarUrl(pictureData.get("url").asText());
                }
            }
            
            return userInfo;
        } catch (Exception e) {
            logger.error("Failed to get Facebook user info: {}", e.getMessage());
            throw e;
        }
    }

    public static class FacebookUserInfo {
        private String id;
        private String name;
        private String email;
        private String avatarUrl;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
