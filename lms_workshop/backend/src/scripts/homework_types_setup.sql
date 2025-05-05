-- Script to enhance homework system with various question types

-- First make sure uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create homework_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'homework_type_enum') THEN
        CREATE TYPE homework_type_enum AS ENUM (
            'quiz', 
            'assignment', 
            'document_upload', 
            'descriptive'
        );
    END IF;
END$$;

-- Create question_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type_enum') THEN
        CREATE TYPE question_type_enum AS ENUM (
            'single_choice', 
            'multiple_choice', 
            'matching', 
            'descriptive'
        );
    END IF;
END$$;

-- Create the homework_questions table
DROP TABLE IF EXISTS "homework_questions" CASCADE;
CREATE TABLE "homework_questions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "homeworkId" UUID REFERENCES "homework"(id) ON DELETE CASCADE,
    "question" TEXT NOT NULL,
    "questionType" question_type_enum NOT NULL,
    "options" JSONB NULL,
    "correctAnswer" JSONB NULL,
    "points" INTEGER DEFAULT 10,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on homeworkId
CREATE INDEX "idx_homework_questions_homeworkId" ON "homework_questions"("homeworkId");

-- Create the homework_responses table
DROP TABLE IF EXISTS "homework_responses" CASCADE;
CREATE TABLE "homework_responses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "homeworkId" UUID REFERENCES "homework"(id) ON DELETE CASCADE,
    "questionId" UUID REFERENCES "homework_questions"(id) ON DELETE CASCADE,
    "userId" UUID REFERENCES "users"(id) ON DELETE CASCADE,
    "response" JSONB NULL,
    "fileUpload" TEXT NULL,
    "grade" INTEGER NULL,
    "feedback" TEXT NULL,
    "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "idx_homework_responses_homeworkId" ON "homework_responses"("homeworkId");
CREATE INDEX "idx_homework_responses_userId" ON "homework_responses"("userId");
CREATE INDEX "idx_homework_responses_questionId" ON "homework_responses"("questionId");

-- Alter homework table to add homeworkType field
ALTER TABLE "homework" ADD COLUMN IF NOT EXISTS "homeworkType" homework_type_enum DEFAULT 'assignment'::homework_type_enum;
ALTER TABLE "homework" ADD COLUMN IF NOT EXISTS "fileAttachment" TEXT NULL;
ALTER TABLE "homework" ADD COLUMN IF NOT EXISTS "submissionFileUrl" TEXT NULL;

-- Print confirmation
SELECT 'Homework system enhanced with question types support.' AS "Message"; 