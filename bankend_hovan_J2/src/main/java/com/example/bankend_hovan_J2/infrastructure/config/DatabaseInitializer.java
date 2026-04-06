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
        if (!tableExists("saved_jobs")) {
            System.out.println("=== Creating saved_jobs table... ===");
            createSavedJobsTable();
            return;
        }

        boolean legacyJobPostingColumnExists = columnExists("saved_jobs", "job_posting_id");
        boolean currentJobColumnExists = columnExists("saved_jobs", "job_id");

        if (legacyJobPostingColumnExists && !currentJobColumnExists) {
            System.out.println("=== Migrating saved_jobs.job_posting_id -> job_id ===");
            jdbcTemplate.execute("ALTER TABLE saved_jobs CHANGE COLUMN job_posting_id job_id BIGINT NOT NULL");
            System.out.println("=== saved_jobs schema migration completed successfully ===");
            return;
        }

        if (legacyJobPostingColumnExists) {
            System.out.println("=== saved_jobs has both legacy and current job columns; leaving schema untouched ===");
            return;
        }

        if (!currentJobColumnExists) {
            System.out.println("=== saved_jobs table is missing job_id, recreating table ===");
            jdbcTemplate.execute("DROP TABLE IF EXISTS saved_jobs");
            createSavedJobsTable();
            return;
        }

        System.out.println("=== saved_jobs table already has correct schema ===");
    }

    private void ensureUsersPasswordColumn() {
        if (!tableExists("users")) {
            System.out.println("=== users table is not available yet, skipping encrypted_password check ===");
            return;
        }

        if (!columnExists("users", "encrypted_password")) {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN encrypted_password VARCHAR(1024) NULL");
            System.out.println("=== Added encrypted_password column to users table ===");
        }
    }

    private void ensureDefaultAdminAccount() {
        if (!tableExists("users")) {
            System.out.println("=== users table is not available yet, skipping default admin seeding ===");
            return;
        }

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

    private boolean tableExists(String tableName) {
        return !jdbcTemplate.queryForList("SHOW TABLES LIKE ?", String.class, tableName).isEmpty();
    }

    private boolean columnExists(String tableName, String columnName) {
        return !jdbcTemplate.queryForList("SHOW COLUMNS FROM " + tableName + " LIKE ?", String.class, columnName).isEmpty();
    }
}
