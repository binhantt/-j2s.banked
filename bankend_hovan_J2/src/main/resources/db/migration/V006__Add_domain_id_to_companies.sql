-- Add domain_id to companies table
ALTER TABLE companies 
ADD COLUMN domain_id BIGINT,
ADD CONSTRAINT fk_companies_domain 
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_companies_domain_id ON companies(domain_id);