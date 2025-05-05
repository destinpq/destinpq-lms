-- Database: psychology_lms
-- Dump created on: $(date)

-- Drop existing tables if they exist
DROP TABLE IF EXISTS "user";
DROP SEQUENCE IF EXISTS user_id_seq;

-- Create sequences
CREATE SEQUENCE user_id_seq
    START WITH 5
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create tables
CREATE TABLE "user" (
    id integer DEFAULT nextval('user_id_seq'::regclass) NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

-- Primary keys and constraints
ALTER TABLE ONLY "user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);
    
ALTER TABLE ONLY "user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);

-- Insert data into users table
INSERT INTO "user" (id, "firstName", "lastName", email, password, "isAdmin", "createdAt", "updatedAt") VALUES
    (1, 'Test', 'User', 'test@example.com', '$2b$10$kY/.JruRfj4Z0P7ndcWFruU3bDXL/7zW3tuauRYobRBhoMOmj5wbC', false, '2025-04-27 14:04:16.957217', '2025-04-27 14:04:16.957217'),
    (2, 'Admin', 'User', 'admin@example.com', '$2b$10$YyszcFFr7MSYRm1I9Wy9HOPJI.ceGKxvIsUbLb6qvxMhYoHPmRjPW', false, '2025-04-27 14:12:44.449148', '2025-04-27 14:12:44.449148'),
    (3, 'Pratik', 'Khanapurkar', 'khanapurkarpratik@gmail.com', '$2b$10$24hXoZI/YVMTrqEMjcnW0ukjW.rDWrE4J55PERChbJIAd/MAeMt3.', false, '2025-05-02 19:49:22.578475', '2025-05-02 19:49:22.578475');

-- Set sequence values
SELECT setval('user_id_seq', 5, true); 