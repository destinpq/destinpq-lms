--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0; -- Heroku might not support this
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

-- COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: course; Type: TABLE; Schema: public; Owner: u9j1vdlg63ms7p
--

CREATE TABLE public.course (
    id integer NOT NULL,
    title character varying NOT NULL,
    instructor character varying NOT NULL,
    description text,
    duration character varying,
    students integer DEFAULT 0 NOT NULL,
    "imageUrl" character varying,
    syllabus json,
    materials json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course OWNER TO u9j1vdlg63ms7p;

--
-- Name: course_id_seq; Type: SEQUENCE; Schema: public; Owner: u9j1vdlg63ms7p
--

CREATE SEQUENCE public.course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_id_seq OWNER TO u9j1vdlg63ms7p;

--
-- Name: course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER SEQUENCE public.course_id_seq OWNED BY public.course.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: u9j1vdlg63ms7p
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    isadmin boolean DEFAULT false NOT NULL,
    createdat timestamp without time zone DEFAULT now() NOT NULL,
    updatedat timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."user" OWNER TO u9j1vdlg63ms7p;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: u9j1vdlg63ms7p
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO u9j1vdlg63ms7p;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: workshop; Type: TABLE; Schema: public; Owner: u9j1vdlg63ms7p
--

CREATE TABLE public.workshop (
    id integer NOT NULL,
    title character varying NOT NULL,
    instructor character varying NOT NULL,
    date date DEFAULT ('now'::text)::date NOT NULL,
    "time" character varying,
    description text,
    duration character varying,
    "meetingId" character varying,
    participants integer DEFAULT 0 NOT NULL,
    materials json,
    agenda json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workshop OWNER TO u9j1vdlg63ms7p;

--
-- Name: workshop_id_seq; Type: SEQUENCE; Schema: public; Owner: u9j1vdlg63ms7p
--

CREATE SEQUENCE public.workshop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workshop_id_seq OWNER TO u9j1vdlg63ms7p;

--
-- Name: workshop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER SEQUENCE public.workshop_id_seq OWNED BY public.workshop.id;


--
-- Name: course id; Type: DEFAULT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public.course ALTER COLUMN id SET DEFAULT nextval('public.course_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: workshop id; Type: DEFAULT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public.workshop ALTER COLUMN id SET DEFAULT nextval('public.workshop_id_seq'::regclass);


--
-- Data for Name: course; Type: TABLE DATA; Schema: public; Owner: u9j1vdlg63ms7p
--

COPY public.course (id, title, instructor, description, duration, students, "imageUrl", syllabus, materials, "createdAt", "updatedAt") FROM stdin;
1	Cognitive Behavioral Techniques	Dr. Jane Smith	Learn about cognitive behavioral therapy techniques and applications.	8 weeks	0	/images/cbt-course.jpg	[{"week":1,"topic":"Introduction to CBT","description":"History and core principles of cognitive behavioral therapy"},{"week":2,"topic":"Cognitive Restructuring","description":"Identifying and challenging negative thought patterns"},{"week":3,"topic":"Behavioral Activation","description":"Techniques to increase engagement in positive activities"}]	[{"id":1,"name":"CBT Introduction","type":"PDF","url":"/materials/cbt-intro.pdf"},{"id":2,"name":"Thought Record Template","type":"DOCX","url":"/materials/thought-record.docx"}]	2025-05-07 03:56:04.471934	2025-05-07 03:56:04.471934
2	Neuroscience Fundamentals	Dr. Michael Johnson	A deep dive into brain structure, functions, and their impact on behavior.	10 weeks	0	/images/neuroscience-course.jpg	[{"week":1,"topic":"Brain Anatomy","description":"Structure and organization of the human brain"},{"week":2,"topic":"Neuronal Communication","description":"Synapses, neurotransmitters, and signal propagation"},{"week":3,"topic":"Neuroplasticity","description":"How the brain changes and adapts"}]	[{"id":1,"name":"Brain Anatomy Overview","type":"PDF","url":"/materials/brain-anatomy.pdf"},{"id":2,"name":"Neurotransmitter Reference","type":"PDF","url":"/materials/neurotransmitters.pdf"}]	2025-05-07 03:56:04.476091	2025-05-07 03:56:04.476091
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: u9j1vdlg63ms7p
--

COPY public."user" (id, firstname, lastname, email, password, isadmin, createdat, updatedat) FROM stdin;
1	Admin	User	admin@example.com	$2b$10$g44TLZZgOR97Kb4avmtODusZCPnQOrwmr/IUF7uK0FBfKulYqnylK	t	2025-05-07 04:02:35.366901	2025-05-07 04:02:35.366901
4	Pratik	Khanapurkar	khanapurkarpratik@gmail.com	$2b$10$XZhgUAQkjIKdcvQlYFlFfeH3VVtxjZx59KmM3Dgqo8WghMMNFJ6sq	f	2025-05-07 04:06:17.091287	2025-05-07 04:06:17.091287
6	Unnati	Mittal	ump52911@gmail.com	$2b$10$1bpaZHA8zz/4ZgT1I58xaeaTWkpEomC2dnKOt6qax49p5GoBHTTR6	f	2025-05-07 04:06:30.841125	2025-05-07 04:06:30.841125
7	Itee	Vijayvargi	iteevijayvargi@gmail.com	$2b$10$2JEIuvY7QRzW.p99NoygYu1bL5n4146rfchE22jLkGw//GeI5Y2ye	f	2025-05-07 04:06:36.934993	2025-05-07 04:06:36.934993
8	Dhriti	Vijayvargi	dhritivijay810@gmail.com	$2b$10$Kc4DJtmi8HoykbLhQ9Eq.OXbGdsHWaN3g2JDdMlT5gvrjvEtV2yWW	f	2025-05-07 04:06:42.962039	2025-05-07 04:06:42.962039
9	K Tarini	Sesha Sai	tarinifire@gmail.com	$2b$10$SxHH5eb59CpQA8LmsX5KuOCUiajOAF2CZO.grrF6D2jbB0FYc3NZ.	f	2025-05-07 04:06:48.701375	2025-05-07 04:06:48.701375
10	Mylapalli Rani	Dhanya Roopa	mrd.roopa15288@gmail.com	$2b$10$IeDyg66lc0VvQ0WZnpSdVur6JElUN9JL2it/Bcc7uH89dhQ9fTmay	f	2025-05-07 04:06:57.540323	2025-05-07 04:06:57.540323
11	Aleeza	Parpiya	aleezaparpiya@gmail.com	$2b$10$ZvCJOlEconPzmwyv0b3PN.iZuRxU8.LPIkhsyzzDMcs9N7xFzBSWq	f	2025-05-07 04:07:03.395891	2025-05-07 04:07:03.395891
12	Akanksha	Dhanraj	akankshadhanraj14@gmail.com	$2b$10$ps4Cm3klGf5l2SPI/KVmu.noHkZhECTk8NtyqwsNyfqIKBTCf3u3C	f	2025-05-07 04:07:09.382913	2025-05-07 04:07:09.382913
13	S	Khushi	skhushiredwal@gmail.com	$2b$10$fuW6rStMh3k2RIN7Ai6kT.GZ3Lyc61rWArLHpu7bkfkQR.hqLFjty	f	2025-05-07 04:07:15.097117	2025-05-07 04:07:15.097117
15	Test	Student	student@example.com	$2b$10$IYdWjUiz0Heodgbkzb47yOuja2pkeGyqHTVO6p0zCnQ.Jo5JdKbZi	f	2025-05-07 04:07:27.288899	2025-05-07 04:07:27.288899
3	Drakanksha	User	drakanksha@destinpq.com	$2b$10$TwYNd64FsjdgNj.ByVnqz.tKtDkeYMEUm1Rg9LpDnt6Rky.kQabDq	t	2025-05-07 04:03:25.27458	2025-05-07 04:07:51.294826
5	Dr Akanksha	Agarwal	drakanksha@destlinpq.com	$2b$10$LmbhNab6fH8QmbgaQDfRNuHPLzFB9xssbzTVjg8hS5puPGCUaU6c2	t	2025-05-07 04:06:24.746352	2025-05-07 04:07:59.057189
14	Pratik	Admin	pratik.khanapurkar.20@gmail.com	$2b$10$xq9yuRS6XNnAs5QYjATUK.6c5RnWoyZqnJdUhq1GPcD11UQ8RNy6i	t	2025-05-07 04:07:21.083102	2025-05-07 04:08:06.408766
16	Admin	User	admin@local.com	$2b$10$eiOoEL5iWjc.b5nn4VHX/e1YaMZJamhorIjjayoaNMKzSDYFNjFC.	t	2025-05-07 04:07:33.260634	2025-05-07 04:08:13.415127
2	Testing	User	test@example.com	$2b$10$Mp/.Wpmyxg56ObVjssd89uL/mYQIabAZLqVyqMFqY7NfTvOoaM7nC	f	2025-05-07 04:02:35.412874	2025-05-07 04:08:54.034137
\.


--
-- Data for Name: workshop; Type: TABLE DATA; Schema: public; Owner: u9j1vdlg63ms7p
--

COPY public.workshop (id, title, instructor, date, "time", description, duration, "meetingId", participants, materials, agenda, "createdAt", "updatedAt") FROM stdin;
1	Advanced Cognitive Techniques	Dr. Akanksha Agarwal	2023-06-15	14:00 - 16:00		2 hours	\N	0	[{"id":1,"name":"Introduction to Behavioral Therapy","url":"/materials/intro-bt.pdf"},{"id":2,"name":"Case Studies","url":"/materials/bt-cases.pdf"}]	[{"time":"14:00","activity":"Introduction and Overview"},{"time":"14:30","activity":"Key Concepts in Behavioral Therapy"},{"time":"15:15","activity":"Break"},{"time":"15:30","activity":"Practical Applications"},{"time":"16:00","activity":"Q&A and Conclusion"}]	2025-05-07 03:56:04.478429	2025-05-07 04:13:20.871513
2	Advanced Cognitive Techniques	Dr. Akanksha Agarwal	2023-07-15	15:00 - 17:00	Explore advanced cognitive techniques for psychology practitioners.	2 hours	\N	0	[{"id":1,"name":"Advanced Cognitive Therapy Slides","url":"/materials/act-slides.pdf"},{"id":2,"name":"Practice Worksheets","url":"/materials/act-worksheets.pdf"}]	[{"time":"15:00","activity":"Introduction to Advanced Techniques"},{"time":"15:30","activity":"Cognitive Restructuring"},{"time":"16:15","activity":"Break"},{"time":"16:30","activity":"Implementation Strategies"},{"time":"17:00","activity":"Wrap-up and Discussion"}]	2025-05-07 03:56:04.519459	2025-05-07 04:23:48.841172
3	Unboxing Psychology	Dr. Akanksha Agarwal	2025-05-05	\N	TEST	\N	980 917 5590	0	[]	\N	2025-05-07 04:20:38.442254	2025-05-07 05:03:02.833617
\.


--
-- Name: course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u9j1vdlg63ms7p
--

SELECT pg_catalog.setval('public.course_id_seq', 2, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u9j1vdlg63ms7p
--

SELECT pg_catalog.setval('public.user_id_seq', 16, true);


--
-- Name: workshop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u9j1vdlg63ms7p
--

SELECT pg_catalog.setval('public.workshop_id_seq', 3, true);


--
-- Name: course PK_bf95180dd756fd204fb01ce4916; Type: CONSTRAINT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: workshop PK_e755b83ccf7c711f998012e1c92; Type: CONSTRAINT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public.workshop
    ADD CONSTRAINT "PK_e755b83ccf7c711f998012e1c92" PRIMARY KEY (id);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: u9j1vdlg63ms7p
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- PostgreSQL database dump complete
--

