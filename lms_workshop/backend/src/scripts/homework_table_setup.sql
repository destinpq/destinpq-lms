-- Script to create and reset the homework table

-- First make sure uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the homework_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'homework_status_enum') THEN
        CREATE TYPE homework_status_enum AS ENUM ('not_started', 'in_progress', 'completed');
    END IF;
END$$;

-- Drop the table if it exists
DROP TABLE IF EXISTS "homework" CASCADE;

-- Create the homework table
CREATE TABLE "homework" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100),
    "dueDate" TIMESTAMP NOT NULL,
    "status" homework_status_enum DEFAULT 'not_started',
    "assignedToId" UUID REFERENCES "users"(id) ON DELETE SET NULL,
    "courseId" UUID REFERENCES "courses"(id) ON DELETE CASCADE,
    "studentResponse" TEXT,
    "grade" INTEGER,
    "instructorFeedback" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX "idx_homework_assignedToId" ON "homework"("assignedToId");
CREATE INDEX "idx_homework_courseId" ON "homework"("courseId");
CREATE INDEX "idx_homework_status" ON "homework"("status");

-- Print confirmation
SELECT 'Homework table has been created/reset successfully.' AS "Message"; 