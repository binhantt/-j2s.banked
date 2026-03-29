package com.example.bankend_hovan_J2.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private int serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HoVan Job Portal API")
                        .version("1.0.0")
                        .description("RESTful API documentation for the HoVan Job Portal backend system. " +
                                "Supports job postings, user authentication (JWT, Google OAuth, GitHub OAuth, Facebook OAuth), " +
                                "company management, blog, notifications, chat, CV uploads, and freelance projects.")
                        .contact(new Contact()
                                .name("HoVan Backend Team")
                                .email("hovan@example.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server")
                ));
    }
}
