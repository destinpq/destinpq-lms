-- Script to remove anti-plagiarism features from the database

-- Drop the trigger
DROP TRIGGER IF EXISTS homework_response_validate_trigger ON "homework_responses";

-- Drop the validation function
DROP FUNCTION IF EXISTS validate_homework_response();

-- Drop the plagiarism sources table
DROP TABLE IF EXISTS "plagiarism_sources";

-- Remove columns from homework_responses table
ALTER TABLE "homework_responses" DROP COLUMN IF EXISTS "plagiarismScore";
ALTER TABLE "homework_responses" DROP COLUMN IF EXISTS "plagiarismDetails";
ALTER TABLE "homework_responses" DROP COLUMN IF EXISTS "inputMethod";
ALTER TABLE "homework_responses" DROP COLUMN IF EXISTS "timeSpent";
ALTER TABLE "homework_responses" DROP COLUMN IF EXISTS "keystrokes";
ALTER TABLE "homework_responses" DROP COLUMN IF EXISTS "validSubmission";

-- Print confirmation
SELECT 'Anti-plagiarism features removed from the homework system.' AS "Message"; 