package com.example.bankend_hovan_J2.infrastructure.config;

import com.example.bankend_hovan_J2.infrastructure.security.AesGcmCryptoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final AesGcmCryptoService aesGcmCryptoService;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate, AesGcmCryptoService aesGcmCryptoService) {
        this.jdbcTemplate = jdbcTemplate;
        this.aesGcmCryptoService = aesGcmCryptoService;
    }

    @Override
    public void run(String... args) {
        try {
            ensureSavedJobsTable();
            ensureUsersPasswordColumn();
            ensureDefaultAdminAccount();
        } catch (Exception e) {
            System.err.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void ensureSavedJobsTable() {
        String checkTableSql = "SHOW TABLES LIKE 'saved_jobs'";
        var tables = jdbcTemplate.queryForList(checkTableSql, String.class);

        if (!tables.isEmpty()) {
            try {
                String checkColumnSql = "SHOW COLUMNS FROM saved_jobs LIKE 'job_posting_id'";
                var columns = jdbcTemplate.queryForList(checkColumnSql);

                if (!columns.isEmpty()) {
                    System.out.println("=== Detected old saved_jobs table schema, recreating... ===");
                    jdbcTemplate.execute("DROP TABLE IF EXISTS saved_jobs");
                    System.out.println("Dropped old saved_jobs table");
                    createSavedJobsTable();
                } else {
                    System.out.println("=== saved_jobs table already has correct schema ===");
                }
            } catch (Exception e) {
                System.out.println("Error checking column: " + e.getMessage());
            }
        } else {
            System.out.println("=== Creating saved_jobs table... ===");
            createSavedJobsTable();
        }
    }

    private void ensureUsersPasswordColumn() {
        jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_password VARCHAR(1024) NULL");
    }

    private void ensureDefaultAdminAccount() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = ?",
                Integer.class,
                "doan44503@gmail.con"
        );

        if (count != null && count > 0) {
            return;
        }

        String encryptedPassword = aesGcmCryptoService.encrypt("123");

        jdbcTemplate.update(
                "INSERT INTO users (email, name, avatar_url, provider, provider_id, user_type, encrypted_password, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
                "doan44503@gmail.con",
                "Admin Doan",
                null,
                "local",
                "doan44503@gmail.con",
                "admin",
                encryptedPassword
        );

        System.out.println("=== Created default admin account: doan44503@gmail.con ===");
    }

    private void createSavedJobsTable() {
        String createTableSql = """
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                job_id BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_job (user_id, job_id),
                INDEX idx_user_id (user_id),
                INDEX idx_job_id (job_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """;

        jdbcTemplate.execute(createTableSql);
        System.out.println("=== Created saved_jobs table successfully ===");
    }
}
