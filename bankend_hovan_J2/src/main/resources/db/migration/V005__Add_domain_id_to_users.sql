-- Add domain_id column to users table
ALTER TABLE users ADD COLUMN domain_id BIGINT;

-- Add foreign key constraint (optional, but recommended)
-- ALTER TABLE users ADD CONSTRAINT fk_users_domain_id FOREIGN KEY (domain_id) REFERENCES domains(id);