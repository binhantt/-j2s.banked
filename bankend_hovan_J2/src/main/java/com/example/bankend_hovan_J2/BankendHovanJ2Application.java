package com.example.bankend_hovan_J2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BankendHovanJ2Application {

	public static void main(String[] args) {
		SpringApplication.run(BankendHovanJ2Application.class, args);
	}

	@Bean
	public CommandLineRunner schemaFix(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				System.out.println("=== Running schema migration fix for blog_categories ===");
				jdbcTemplate.execute("ALTER TABLE blog_categories DROP COLUMN active");
				System.out.println("=== Schema fix completed successfully ===");
			} catch (Exception e) {
				System.out.println("=== Schema fix skipped or failed: " + e.getMessage() + " ===");
			}
		};
	}
}
