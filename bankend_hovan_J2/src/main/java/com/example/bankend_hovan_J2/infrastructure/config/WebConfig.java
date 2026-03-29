package com.example.bankend_hovan_J2.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded images and other non-sensitive files
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:uploads/images/");
        
        registry.addResourceHandler("/uploads/company/**")
                .addResourceLocations("file:uploads/company/");
        
        registry.addResourceHandler("/uploads/blog/**")
                .addResourceLocations("file:uploads/blog/");
        
        // CV files are served through CVFileController with access control
        // DO NOT add /uploads/cv/** here for security reasons
    }
}
