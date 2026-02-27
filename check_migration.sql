-- Kiểm tra cấu trúc bảng project_applications
DESCRIBE project_applications;

-- Nếu chưa có cột cv_url và achievements, chạy lệnh này:
ALTER TABLE project_applications 
ADD COLUMN achievements TEXT AFTER cover_letter,
ADD COLUMN cv_url VARCHAR(500) AFTER achievements;

-- Kiểm tra lại
DESCRIBE project_applications;
