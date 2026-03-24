-- Create domains table
CREATE TABLE domains (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    job_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some default domains
INSERT INTO domains (name, description, is_active, job_count) VALUES
('Công nghệ thông tin', 'Phát triển phần mềm, lập trình, IT', TRUE, 0),
('Tài chính - Ngân hàng', 'Ngân hàng, bảo hiểm, đầu tư', TRUE, 0),
('Y tế - Dược phẩm', 'Bác sĩ, y tá, dược sĩ', TRUE, 0),
('Giáo dục - Đào tạo', 'Giảng viên, giáo viên, đào tạo', TRUE, 0),
('Sản xuất - Chế tạo', 'Nhà máy, sản xuất, kỹ thuật', TRUE, 0),
('Bán lẻ - Thương mại', 'Bán hàng, marketing, thương mại', TRUE, 0),
('Du lịch - Khách sạn', 'Du lịch, nhà hàng, khách sạn', TRUE, 0),
('Bất động sản', 'Môi giới, đầu tư bất động sản', TRUE, 0),
('Truyền thông - Marketing', 'Quảng cáo, truyền thông, PR', TRUE, 0),
('Logistics - Vận tải', 'Vận chuyển, kho bãi, logistics', TRUE, 0);