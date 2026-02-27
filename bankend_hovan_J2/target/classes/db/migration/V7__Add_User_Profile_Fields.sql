-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN current_position VARCHAR(255),
ADD COLUMN hometown VARCHAR(255),
ADD COLUMN current_location VARCHAR(255),
ADD COLUMN current_latitude DECIMAL(10, 8),
ADD COLUMN current_longitude DECIMAL(11, 8),
ADD COLUMN location_updated_at TIMESTAMP,
ADD COLUMN cv_url VARCHAR(500),
ADD COLUMN certificate_images TEXT,
ADD COLUMN phone VARCHAR(20),
ADD COLUMN bio TEXT;
