-- Script để fix database cho freelance application

-- 1. Kiểm tra và thêm cột achievements nếu chưa có
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'project_applications' 
  AND COLUMN_NAME = 'achievements';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE project_applications ADD COLUMN achievements TEXT AFTER cover_letter',
    'SELECT "Column achievements already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Kiểm tra và thêm cột cv_url nếu chưa có
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'project_applications' 
  AND COLUMN_NAME = 'cv_url';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE project_applications ADD COLUMN cv_url VARCHAR(500) AFTER achievements',
    'SELECT "Column cv_url already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Hiển thị cấu trúc bảng để xác nhận
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'project_applications'
ORDER BY ORDINAL_POSITION;
