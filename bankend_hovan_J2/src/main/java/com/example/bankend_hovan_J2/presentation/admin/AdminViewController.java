package com.example.bankend_hovan_J2.presentation.admin;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Controller để serve trang Admin Dashboard (HTML/JS).
 * Truy cập: http://localhost:8080/admin
 */
@RestController
@RequestMapping("/admin")
public class AdminViewController {

    @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
    public String serveAdminPage() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/admin/index.html");
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }
}
