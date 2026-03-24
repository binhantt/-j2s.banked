-- Remove industry column from companies table since we now use domain_id
ALTER TABLE companies DROP COLUMN industry;