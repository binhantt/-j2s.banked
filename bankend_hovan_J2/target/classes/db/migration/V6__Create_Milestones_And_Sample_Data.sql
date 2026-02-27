-- Create project_milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    percentage INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES freelance_projects(id) ON DELETE CASCADE
);

-- Insert sample freelance projects
INSERT INTO freelance_projects (client_id, title, description, budget, deposit_amount, deposit_status, status, progress, deadline, created_at, updated_at) VALUES
(1, 'Thiết kế website bán hàng', 'Cần thiết kế một website bán hàng online với đầy đủ tính năng:\n\n• Giao diện hiện đại, responsive trên mọi thiết bị\n• Hệ thống giỏ hàng và thanh toán online\n• Quản lý sản phẩm, danh mục\n• Tích hợp thanh toán VNPay, Momo\n• Dashboard quản trị viên\n• Tối ưu SEO\n\nCông nghệ yêu cầu: React, Node.js, MongoDB', 20000000, 4000000, 'pending', 'draft', 0, '2024-12-31', NOW(), NOW()),

(2, 'Phát triển ứng dụng mobile quản lý công việc', 'Xây dựng ứng dụng mobile quản lý công việc cá nhân và nhóm:\n\n• Tạo và quản lý task, project\n• Phân công công việc cho thành viên\n• Thông báo realtime\n• Báo cáo tiến độ\n• Tích hợp calendar\n• Chat nhóm\n\nYêu cầu: React Native, Firebase, Node.js', 35000000, 7000000, 'paid', 'in_progress', 45, '2024-06-30', NOW(), NOW()),

(1, 'Thiết kế logo và bộ nhận diện thương hiệu', 'Thiết kế logo và bộ nhận diện thương hiệu cho startup công nghệ:\n\n• Logo chính và các biến thể\n• Bộ màu thương hiệu\n• Typography\n• Business card, letterhead\n• Social media templates\n• Brand guideline\n\nPhong cách: Hiện đại, tối giản, công nghệ', 8000000, 1600000, 'paid', 'completed', 100, '2024-03-15', NOW(), NOW());

-- Insert milestones for Project 1 (Website bán hàng - draft)
INSERT INTO project_milestones (project_id, title, percentage, status, due_date, created_at, updated_at) VALUES
(1, 'Phân tích yêu cầu và thiết kế UI/UX', 25, 'pending', '2024-04-15', NOW(), NOW()),
(1, 'Phát triển Frontend', 35, 'pending', '2024-05-30', NOW(), NOW()),
(1, 'Phát triển Backend & API', 30, 'pending', '2024-07-15', NOW(), NOW()),
(1, 'Testing và Deploy', 10, 'pending', '2024-08-31', NOW(), NOW());

-- Insert milestones for Project 2 (Mobile app - in progress)
INSERT INTO project_milestones (project_id, title, percentage, status, due_date, created_at, updated_at) VALUES
(2, 'Thiết kế UI/UX', 20, 'completed', '2024-02-28', NOW(), NOW()),
(2, 'Phát triển tính năng quản lý task', 30, 'completed', '2024-03-31', NOW(), NOW()),
(2, 'Phát triển tính năng chat và notification', 25, 'in_progress', '2024-05-15', NOW(), NOW()),
(2, 'Tích hợp Firebase và testing', 15, 'pending', '2024-06-15', NOW(), NOW()),
(2, 'Deploy và launch', 10, 'pending', '2024-06-30', NOW(), NOW());

-- Insert milestones for Project 3 (Logo design - completed)
INSERT INTO project_milestones (project_id, title, percentage, status, due_date, created_at, updated_at) VALUES
(3, 'Research và concept', 20, 'completed', '2024-02-01', NOW(), NOW()),
(3, 'Thiết kế logo và các biến thể', 40, 'completed', '2024-02-20', NOW(), NOW()),
(3, 'Thiết kế bộ nhận diện', 30, 'completed', '2024-03-10', NOW(), NOW()),
(3, 'Hoàn thiện brand guideline', 10, 'completed', '2024-03-15', NOW(), NOW());
