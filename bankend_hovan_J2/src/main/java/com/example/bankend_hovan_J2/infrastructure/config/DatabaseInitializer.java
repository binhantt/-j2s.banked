package com.example.bankend_hovan_J2.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Check if saved_jobs table exists and has wrong schema
            String checkTableSql = "SHOW TABLES LIKE 'saved_jobs'";
            var tables = jdbcTemplate.queryForList(checkTableSql, String.class);
            
            if (!tables.isEmpty()) {
                // Check if table has old column job_posting_id
                try {
                    String checkColumnSql = "SHOW COLUMNS FROM saved_jobs LIKE 'job_posting_id'";
                    var columns = jdbcTemplate.queryForList(checkColumnSql);
                    
                    if (!columns.isEmpty()) {
                        System.out.println("=== Detected old saved_jobs table schema, recreating... ===");
                        
                        // Drop old table
                        jdbcTemplate.execute("DROP TABLE IF EXISTS saved_jobs");
                        System.out.println("Dropped old saved_jobs table");
                        
                        // Create new table with correct schema
                        createSavedJobsTable();
                    } else {
                        System.out.println("=== saved_jobs table already has correct schema ===");
                    }
                } catch (Exception e) {
                    System.out.println("Error checking column: " + e.getMessage());
                }
            } else {
                // Table doesn't exist, create it
                System.out.println("=== Creating saved_jobs table... ===");
                createSavedJobsTable();
            }
            
        } catch (Exception e) {
            System.err.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
        }
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
