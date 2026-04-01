-- Add experience_years_min column to job_postings table
-- This column stores the minimum years of experience required (as INTEGER)
-- NULL means "not specified" or "negotiable"

ALTER TABLE job_postings
ADD COLUMN experience_years_min INT DEFAULT NULL;

-- Migration: Map existing String experience values to INT
-- Format: "0-1", "1-3", "3-5", "5+"
UPDATE job_postings SET experience_years_min =
    CASE
        WHEN experience = '0-1' OR experience LIKE '%0-1%' THEN 0
        WHEN experience = '1-3' OR experience LIKE '%1-3%' THEN 1
        WHEN experience = '3-5' OR experience LIKE '%3-5%' THEN 3
        WHEN experience = '5+' OR experience LIKE '%5+%' THEN 5
        WHEN experience REGEXP '^[0-9]+$' THEN CAST(experience AS SIGNED)
        ELSE NULL
    END
WHERE experience IS NOT NULL AND experience != '';
