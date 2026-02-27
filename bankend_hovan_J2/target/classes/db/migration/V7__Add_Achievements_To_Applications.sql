-- Add achievements and cv_url columns to project_applications table
ALTER TABLE project_applications 
ADD COLUMN achievements TEXT AFTER cover_letter,
ADD COLUMN cv_url VARCHAR(500) AFTER achievements;

-- Add comments
ALTER TABLE project_applications 
MODIFY COLUMN achievements TEXT COMMENT 'Awards, certificates, and notable achievements',
MODIFY COLUMN cv_url VARCHAR(500) COMMENT 'CV file URL attached with application';
