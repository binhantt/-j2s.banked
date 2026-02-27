package com.example.bankend_hovan_J2.presentation.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/migration")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DatabaseMigrationController {

    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/add-cv-columns")
    public ResponseEntity<Map<String, Object>> addCvColumns() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Check if achievements column exists
            String checkAchievements = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'project_applications' " +
                    "AND COLUMN_NAME = 'achievements'";
            
            Integer achievementsExists = jdbcTemplate.queryForObject(checkAchievements, Integer.class);
            
            if (achievementsExists == 0) {
                log.info("Adding achievements column...");
                jdbcTemplate.execute("ALTER TABLE project_applications " +
                        "ADD COLUMN achievements TEXT AFTER cover_letter");
                result.put("achievements", "Added successfully");
            } else {
                result.put("achievements", "Already exists");
            }
            
            // Check if cv_url column exists
            String checkCvUrl = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'project_applications' " +
                    "AND COLUMN_NAME = 'cv_url'";
            
            Integer cvUrlExists = jdbcTemplate.queryForObject(checkCvUrl, Integer.class);
            
            if (cvUrlExists == 0) {
                log.info("Adding cv_url column...");
                jdbcTemplate.execute("ALTER TABLE project_applications " +
                        "ADD COLUMN cv_url VARCHAR(500) AFTER achievements");
                result.put("cv_url", "Added successfully");
            } else {
                result.put("cv_url", "Already exists");
            }
            
            result.put("success", true);
            result.put("message", "Migration completed successfully");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Migration error", e);
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @PostMapping("/sync-cv-from-user-cvs")
    public ResponseEntity<Map<String, Object>> syncCvFromUserCvs() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Update project_applications with CV from user_cvs
            String updateSql = "UPDATE project_applications pa " +
                    "LEFT JOIN ( " +
                    "    SELECT user_id, file_url " +
                    "    FROM user_cvs " +
                    "    WHERE is_default = true " +
                    "    OR visibility IN ('public', 'application_only') " +
                    "    ORDER BY is_default DESC, created_at DESC " +
                    ") cv ON pa.freelancer_id = cv.user_id " +
                    "SET pa.cv_url = cv.file_url " +
                    "WHERE pa.cv_url IS NULL AND cv.file_url IS NOT NULL";
            
            int updated = jdbcTemplate.update(updateSql);
            
            result.put("success", true);
            result.put("message", "CV sync completed");
            result.put("updated_count", updated);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Sync CV error", e);
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @GetMapping("/check-columns")
    public ResponseEntity<Map<String, Object>> checkColumns() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String sql = "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE " +
                    "FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'project_applications' " +
                    "ORDER BY ORDINAL_POSITION";
            
            var columns = jdbcTemplate.queryForList(sql);
            result.put("columns", columns);
            result.put("success", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Check columns error", e);
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}
