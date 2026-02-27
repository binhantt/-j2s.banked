-- Create project_applications table
CREATE TABLE IF NOT EXISTS project_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    cover_letter TEXT,
    proposed_price DECIMAL(15, 2),
    estimated_duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES freelance_projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (project_id, freelancer_id)
);

-- Add index for faster queries
CREATE INDEX idx_project_applications_project ON project_applications(project_id);
CREATE INDEX idx_project_applications_freelancer ON project_applications(freelancer_id);
CREATE INDEX idx_project_applications_status ON project_applications(status);
