-- Script to set up tables for LMS database

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Create user table if not exists
CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "isAdmin" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workshop table if not exists
CREATE TABLE IF NOT EXISTS workshop (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "maxParticipants" INTEGER DEFAULT 20,
  "durationWeeks" INTEGER DEFAULT 1,
  instructor VARCHAR(255),
  "scheduledAt" TIMESTAMP WITH TIME ZONE
);

-- Create workshop_attendees table if not exists
CREATE TABLE IF NOT EXISTS workshop_attendees (
  id SERIAL PRIMARY KEY,
  "workshopId" INTEGER REFERENCES workshop(id) ON DELETE CASCADE,
  "userId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course table if not exists
CREATE TABLE IF NOT EXISTS course (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "totalModules" INTEGER DEFAULT 0,
  "enrolledStudents" INTEGER DEFAULT 0,
  "associatedWorkshop" VARCHAR(255),
  "maxStudents" INTEGER DEFAULT 30,
  "totalWeeks" INTEGER DEFAULT 1
);

-- Create course_students table if not exists
CREATE TABLE IF NOT EXISTS course_students (
  id SERIAL PRIMARY KEY,
  "courseId" INTEGER REFERENCES course(id) ON DELETE CASCADE,
  "userId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "enrolledAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create module table if not exists
CREATE TABLE IF NOT EXISTS module (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  "courseId" INTEGER REFERENCES course(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lesson table if not exists
CREATE TABLE IF NOT EXISTS lesson (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  "order" INTEGER NOT NULL,
  "moduleId" INTEGER REFERENCES module(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create homework table if not exists
CREATE TABLE IF NOT EXISTS homework (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  "dueDate" TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'not_started',
  "assignedToId" INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
  "courseId" INTEGER REFERENCES course(id) ON DELETE CASCADE,
  "studentResponse" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workshop_session table if not exists
CREATE TABLE IF NOT EXISTS workshop_session (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "workshopId" INTEGER REFERENCES workshop(id) ON DELETE CASCADE,
  "scheduledAt" TIMESTAMP WITH TIME ZONE,
  "durationMinutes" INTEGER DEFAULT 60,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message table if not exists
CREATE TABLE IF NOT EXISTS message (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  "fromUserId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "toUserId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "read" BOOLEAN DEFAULT false
);

-- Create achievement table if not exists
CREATE TABLE IF NOT EXISTS achievement (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "badgeUrl" VARCHAR(255),
  points INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table if not exists
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "achievementId" INTEGER REFERENCES achievement(id) ON DELETE CASCADE,
  "awardedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create achievement_users table if not exists
CREATE TABLE IF NOT EXISTS achievement_users (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "achievementId" INTEGER REFERENCES achievement(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Create a test user if none exists
INSERT INTO "user" ("firstName", "lastName", email, password, "isAdmin")
SELECT 'Test', 'User', 'test@example.com', '$2b$10$5QvVmQGX7EQ.lfnox0zHhuQ9H1Wd/nEcJ/TR8rjE2AaUqNcb1xM0O', false
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email = 'test@example.com');

-- Create an admin user if none exists
INSERT INTO "user" ("firstName", "lastName", email, password, "isAdmin")
SELECT 'Admin', 'User', 'admin@example.com', '$2b$10$5QvVmQGX7EQ.lfnox0zHhuQ9H1Wd/nEcJ/TR8rjE2AaUqNcb1xM0O', true
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email = 'admin@example.com'); 