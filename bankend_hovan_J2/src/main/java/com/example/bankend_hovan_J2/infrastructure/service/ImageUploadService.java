package com.example.bankend_hovan_J2.infrastructure.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
public class ImageUploadService {

    @Value("${imgbb.api.key:76cbe35884a59e2a3cee66b8113d0753}")
    private String imgbbApiKey;

    private static final String IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

    public String uploadImage(MultipartFile file) {
        try {
            // Convert file to base64
            byte[] fileContent = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(fileContent);

            // Prepare request
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("key", imgbbApiKey);
            body.add("image", base64Image);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            // Upload to ImgBB
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    IMGBB_UPLOAD_URL,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                String imageUrl = (String) data.get("url");
                
                log.info("Image uploaded successfully: {}", imageUrl);
                return imageUrl;
            }

            throw new RuntimeException("Failed to upload image to ImgBB");

        } catch (Exception e) {
            log.error("Error uploading image: ", e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }
}
