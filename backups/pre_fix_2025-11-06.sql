--
-- PostgreSQL database dump
--

\restrict xjlDoIpGEVluiaLe2zx2mngU91qIsfYTxpLCknsArhKqAVMNWMR8KP0AEcX4Jmh

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AssetKind; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."AssetKind" AS ENUM (
    'ORIGINAL',
    'CLIP',
    'SRT',
    'VTT',
    'THUMBNAIL'
);


ALTER TYPE public."AssetKind" OWNER TO clipforge;

--
-- Name: ExportFormat; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."ExportFormat" AS ENUM (
    'MP4',
    'WEBM',
    'MOV'
);


ALTER TYPE public."ExportFormat" OWNER TO clipforge;

--
-- Name: ExportStatus; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."ExportStatus" AS ENUM (
    'PENDING',
    'RENDERING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."ExportStatus" OWNER TO clipforge;

--
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."JobStatus" AS ENUM (
    'PENDING',
    'RUNNING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."JobStatus" OWNER TO clipforge;

--
-- Name: JobType; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."JobType" AS ENUM (
    'INGEST',
    'TRANSCRIBE',
    'DETECT_HIGHLIGHTS',
    'RENDER_EXPORT'
);


ALTER TYPE public."JobType" OWNER TO clipforge;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PENDING',
    'INGESTING',
    'TRANSCRIBING',
    'DETECTING',
    'READY',
    'FAILED'
);


ALTER TYPE public."ProjectStatus" OWNER TO clipforge;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: clipforge
--

CREATE TYPE public."Role" AS ENUM (
    'OWNER',
    'EDITOR',
    'REVIEWER'
);


ALTER TYPE public."Role" OWNER TO clipforge;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ApiKey; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "userId" text NOT NULL,
    "keyHash" text NOT NULL,
    name text,
    "rateLimit" integer DEFAULT 100 NOT NULL,
    "quotaMinutes" integer DEFAULT 10000 NOT NULL,
    "quotaExports" integer DEFAULT 1000 NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."ApiKey" OWNER TO clipforge;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    kind public."AssetKind" NOT NULL,
    url text NOT NULL,
    duration double precision,
    "mimeType" text,
    size bigint,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Asset" OWNER TO clipforge;

--
-- Name: BrandKit; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."BrandKit" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    name text NOT NULL,
    fonts jsonb NOT NULL,
    colors jsonb NOT NULL,
    "logoUrl" text,
    "captionStyle" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BrandKit" OWNER TO clipforge;

--
-- Name: Export; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Export" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "momentId" text NOT NULL,
    status public."ExportStatus" DEFAULT 'PENDING'::public."ExportStatus" NOT NULL,
    format public."ExportFormat" DEFAULT 'MP4'::public."ExportFormat" NOT NULL,
    template text,
    artifacts jsonb NOT NULL,
    metrics jsonb,
    "publishedTo" text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Export" OWNER TO clipforge;

--
-- Name: Job; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Job" (
    id text NOT NULL,
    type public."JobType" NOT NULL,
    "projectId" text NOT NULL,
    status public."JobStatus" DEFAULT 'PENDING'::public."JobStatus" NOT NULL,
    input jsonb NOT NULL,
    output jsonb,
    error text,
    retries integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Job" OWNER TO clipforge;

--
-- Name: Membership; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Membership" (
    id text NOT NULL,
    role public."Role" DEFAULT 'EDITOR'::public."Role" NOT NULL,
    "orgId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Membership" OWNER TO clipforge;

--
-- Name: Moment; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Moment" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "tStart" double precision NOT NULL,
    "tEnd" double precision NOT NULL,
    duration double precision NOT NULL,
    score double precision DEFAULT 0.0 NOT NULL,
    features jsonb NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    title text,
    "aspectRatio" text DEFAULT '16:9'::text NOT NULL,
    "targetPlatform" text
);


ALTER TABLE public."Moment" OWNER TO clipforge;

--
-- Name: Organization; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Organization" OWNER TO clipforge;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    title text NOT NULL,
    "sourceUrl" text,
    status public."ProjectStatus" DEFAULT 'PENDING'::public."ProjectStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clipSettings" jsonb
);


ALTER TABLE public."Project" OWNER TO clipforge;

--
-- Name: Transcript; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Transcript" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    data jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Transcript" OWNER TO clipforge;

--
-- Name: UsageLedger; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."UsageLedger" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "minutesProcessed" double precision DEFAULT 0.0 NOT NULL,
    "exportsCount" integer DEFAULT 0 NOT NULL,
    period text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UsageLedger" OWNER TO clipforge;

--
-- Name: User; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO clipforge;

--
-- Name: Webhook; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public."Webhook" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "userId" text NOT NULL,
    url text NOT NULL,
    secret text NOT NULL,
    events text[] DEFAULT ARRAY['job.completed'::text, 'export.ready'::text],
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Webhook" OWNER TO clipforge;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: clipforge
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO clipforge;

--
-- Data for Name: ApiKey; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."ApiKey" (id, "orgId", "userId", "keyHash", name, "rateLimit", "quotaMinutes", "quotaExports", "lastUsedAt", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Asset" (id, "projectId", kind, url, duration, "mimeType", size, "createdAt") FROM stdin;
cmhlx6ukt00037tn2ha0lnv3m	cmhlx6t0z00017tn2pvb1mdcm	ORIGINAL	projects/cmhlx6t0z00017tn2pvb1mdcm/source.mp4	5771.528667	video/mp4	206608753	2025-11-05 11:34:06.414
cmhlyx0ff000epti4km9tk85a	cmhlyx04b000cpti4xv2xvdm0	ORIGINAL	projects/cmhlyx04b000cpti4xv2xvdm0/source.mp4	90.8	video/mp4	32543647	2025-11-05 12:22:26.668
cmhlzalhs000lpti4odl171tp	cmhlzal6z000jpti4i2j1b3s8	ORIGINAL	projects/cmhlzal6z000jpti4i2j1b3s8/source.mp4	90.8	video/mp4	32543647	2025-11-05 12:33:00.496
cmhlzcib0000wpti4z8s8esy1	cmhlzchh0000upti4jkwreptl	ORIGINAL	projects/cmhlzchh0000upti4jkwreptl/source.mp4	1261.334	video/mp4	158613975	2025-11-05 12:34:29.677
cmhlzq74m001bpti4xldq2mav	cmhlzq6u00019pti45p0v3td4	ORIGINAL	projects/cmhlzq6u00019pti45p0v3td4/source.mp4	90.8	video/mp4	32543647	2025-11-05 12:45:08.375
cmhlzr6yx001ipti4f1bk023i	cmhlzr6mo001gpti4tdqeynw8	ORIGINAL	projects/cmhlzr6mo001gpti4tdqeynw8/source.mp4	80.26	video/mp4	14946092	2025-11-05 12:45:54.826
cmhm008rc001ppti4wdb2kh65	cmhm008gy001npti4mm7jbbxn	ORIGINAL	projects/cmhm008gy001npti4mm7jbbxn/source.mp4	90.8	video/mp4	32543647	2025-11-05 12:52:57.048
cmhm17ru300038k23rqcguj0f	cmhm17ro100018k236dtcye8o	ORIGINAL	projects/cmhm17ro100018k236dtcye8o/source.mp4	55	video/mp4	1692960	2025-11-05 13:26:47.979
cmhm3hyg10003vgs71vc3wyj4	cmhm3hy2c0001vgs79730fa80	ORIGINAL	projects/cmhm3hy2c0001vgs79730fa80/source.mp4	90.8	video/mp4	32543647	2025-11-05 14:30:42.338
cmhm4b4c1000avgs7h1ysrr6h	cmhm4b42z0008vgs70vsnq5lk	ORIGINAL	projects/cmhm4b42z0008vgs70vsnq5lk/source.mp4	80.26	video/mp4	14946092	2025-11-05 14:53:22.993
cmhm4dsrt000hvgs715fsd25s	cmhm4dsl2000fvgs7lt3wrkz0	ORIGINAL	projects/cmhm4dsl2000fvgs7lt3wrkz0/source.mp4	80.26	video/mp4	14946092	2025-11-05 14:55:27.978
cmhm4gioi000ovgs7gthuvzck	cmhm4gihl000mvgs7qt7ilky0	ORIGINAL	projects/cmhm4gihl000mvgs7qt7ilky0/source.mp4	80.26	video/mp4	14946092	2025-11-05 14:57:34.866
cmhm57i4s0003801c0a67fw03	cmhm57hvz0001801cqfe1ox6m	ORIGINAL	projects/cmhm57hvz0001801cqfe1ox6m/source.mp4	80.26	video/mp4	14946092	2025-11-05 15:18:33.869
cmhm58hjw000a801cquxz882f	cmhm58hcl0008801ctsqz13zx	ORIGINAL	projects/cmhm58hcl0008801ctsqz13zx/source.mp4	80.26	video/mp4	14946092	2025-11-05 15:19:19.772
cmhn8qlz4000r801c1uxbic70	cmhn8qlpm000p801c8qquitam	ORIGINAL	projects/cmhn8qlpm000p801c8qquitam/source.mp4	275.853047	video/mp4	11082726	2025-11-06 09:45:10.336
cmhn8x51c0012801c8nz5sm7a	cmhn8x4vk0010801cjzgwnmds	ORIGINAL	projects/cmhn8x4vk0010801cjzgwnmds/source.mp4	275.853047	video/mp4	11082726	2025-11-06 09:50:14.976
\.


--
-- Data for Name: BrandKit; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."BrandKit" (id, "orgId", name, fonts, colors, "logoUrl", "captionStyle", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Export; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Export" (id, "projectId", "momentId", status, format, template, artifacts, metrics, "publishedTo", "createdAt", "updatedAt") FROM stdin;
cmhlzbs8q000qpti4ynmuv6f1	cmhlyx04b000cpti4xv2xvdm0	cmhlyx6on000fpti4kzfezlz4	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhlyx04b000cpti4xv2xvdm0/exports/cmhlyx6on000fpti4kzfezlz4.mp4"}	\N	{}	2025-11-05 12:33:55.898	2025-11-05 12:33:55.898
cmhlzbsbk000spti4s73lzxj1	cmhlyx04b000cpti4xv2xvdm0	cmhlyx6on000gpti4g36bdlrx	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhlyx04b000cpti4xv2xvdm0/exports/cmhlyx6on000gpti4g36bdlrx.mp4"}	\N	{}	2025-11-05 12:33:56	2025-11-05 12:33:56
cmhlzekdb0011pti4z3m4zdl4	cmhlyx04b000cpti4xv2xvdm0	cmhlyx6on000hpti40o9n7kva	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhlyx04b000cpti4xv2xvdm0/exports/cmhlyx6on000hpti40o9n7kva.mp4"}	\N	{}	2025-11-05 12:36:05.663	2025-11-05 12:36:05.663
cmhlzfa4k0013pti4mvat8cwp	cmhlyx04b000cpti4xv2xvdm0	cmhlyx6on000fpti4kzfezlz4	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhlyx04b000cpti4xv2xvdm0/exports/cmhlyx6on000fpti4kzfezlz4.mp4"}	\N	{}	2025-11-05 12:36:39.044	2025-11-05 12:36:39.044
cmhlzfa780015pti4h5jwrdag	cmhlyx04b000cpti4xv2xvdm0	cmhlyx6on000gpti4g36bdlrx	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhlyx04b000cpti4xv2xvdm0/exports/cmhlyx6on000gpti4g36bdlrx.mp4"}	\N	{}	2025-11-05 12:36:39.14	2025-11-05 12:36:39.14
cmhlzfa9h0017pti4i7f6l3g9	cmhlyx04b000cpti4xv2xvdm0	cmhlyx6on000hpti40o9n7kva	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhlyx04b000cpti4xv2xvdm0/exports/cmhlyx6on000hpti40o9n7kva.mp4"}	\N	{}	2025-11-05 12:36:39.222	2025-11-05 12:36:39.222
cmhm064qy001upti4ltmvp67a	cmhm008gy001npti4mm7jbbxn	cmhm00ehz001qpti4vu0wpdga	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm008gy001npti4mm7jbbxn/exports/cmhm00ehz001qpti4vu0wpdga.mp4"}	\N	{}	2025-11-05 12:57:31.786	2025-11-05 12:57:31.786
cmhm064t6001wpti4jmi7n94i	cmhm008gy001npti4mm7jbbxn	cmhm00ehz001rpti4zrdlxkbw	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm008gy001npti4mm7jbbxn/exports/cmhm00ehz001rpti4zrdlxkbw.mp4"}	\N	{}	2025-11-05 12:57:31.867	2025-11-05 12:57:31.867
cmhm064v8001ypti46wizcx4j	cmhm008gy001npti4mm7jbbxn	cmhm00ehz001spti4rkw0z51i	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm008gy001npti4mm7jbbxn/exports/cmhm00ehz001spti4rkw0z51i.mp4"}	\N	{}	2025-11-05 12:57:31.941	2025-11-05 12:57:31.941
cmhm4hp7m000tvgs7h1h99wbc	cmhm4gihl000mvgs7qt7ilky0	cmhm4grlf000pvgs79byi8657	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm4gihl000mvgs7qt7ilky0/exports/cmhm4grlf000pvgs79byi8657.mp4"}	\N	{}	2025-11-05 14:58:29.986	2025-11-05 14:58:29.986
cmhm4hp9b000vvgs7gu72w55b	cmhm4gihl000mvgs7qt7ilky0	cmhm4grlf000qvgs70i50yzo6	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm4gihl000mvgs7qt7ilky0/exports/cmhm4grlf000qvgs70i50yzo6.mp4"}	\N	{}	2025-11-05 14:58:30.047	2025-11-05 14:58:30.047
cmhm5974v000j801c35988z7x	cmhm58hcl0008801ctsqz13zx	cmhm58r01000b801cry56x69q	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm58hcl0008801ctsqz13zx/exports/cmhm58r01000b801cry56x69q.mp4"}	\N	{}	2025-11-05 15:19:52.927	2025-11-05 15:19:52.927
cmhm599f4000l801cewvgx6ih	cmhm58hcl0008801ctsqz13zx	cmhm58r01000c801cc58w8hl6	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm58hcl0008801ctsqz13zx/exports/cmhm58r01000c801cc58w8hl6.mp4"}	\N	{}	2025-11-05 15:19:55.889	2025-11-05 15:19:55.889
cmhm599gr000n801cqqmsh3ws	cmhm58hcl0008801ctsqz13zx	cmhm58r01000d801cxw7033s7	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhm58hcl0008801ctsqz13zx/exports/cmhm58r01000d801cxw7033s7.mp4"}	\N	{}	2025-11-05 15:19:55.948	2025-11-05 15:19:55.948
cmhn8sag7000w801c8niu0mmr	cmhn8qlpm000p801c8qquitam	cmhn8qulr000s801conk7sdcn	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhn8qlpm000p801c8qquitam/exports/cmhn8qulr000s801conk7sdcn.mp4"}	\N	{}	2025-11-06 09:46:28.711	2025-11-06 09:46:28.711
cmhn8sbqq000y801cv0rep04c	cmhn8qlpm000p801c8qquitam	cmhn8qulr000t801ctqwocn88	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhn8qlpm000p801c8qquitam/exports/cmhn8qulr000t801ctqwocn88.mp4"}	\N	{}	2025-11-06 09:46:30.387	2025-11-06 09:46:30.387
cmhn8xwk4001a801cwesh1x7x	cmhn8x4vk0010801cjzgwnmds	cmhn8xeat0013801cgo4pdeu5	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhn8x4vk0010801cjzgwnmds/exports/cmhn8xeat0013801cgo4pdeu5.mp4"}	\N	{}	2025-11-06 09:50:50.644	2025-11-06 09:50:50.644
cmhn8xx9a001c801ch097dc9m	cmhn8x4vk0010801cjzgwnmds	cmhn8xeat0014801cmzgmync3	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhn8x4vk0010801cjzgwnmds/exports/cmhn8xeat0014801cmzgmync3.mp4"}	\N	{}	2025-11-06 09:50:51.55	2025-11-06 09:50:51.55
cmhn8xxym001e801c2ff904mx	cmhn8x4vk0010801cjzgwnmds	cmhn8xeat0015801c95ims6vk	COMPLETED	MP4	\N	{"mp4_url": "projects/cmhn8x4vk0010801cjzgwnmds/exports/cmhn8xeat0015801c95ims6vk.mp4"}	\N	{}	2025-11-06 09:50:52.463	2025-11-06 09:50:52.463
\.


--
-- Data for Name: Job; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Job" (id, type, "projectId", status, input, output, error, retries, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Membership" (id, role, "orgId", "userId") FROM stdin;
cmhkskrsl0002jt1d62xx01qp	OWNER	cmhkskrsl0004jt1dnwsoevzq	cmhkskrsl0000jt1dz6xll1zq
\.


--
-- Data for Name: Moment; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Moment" (id, "projectId", "tStart", "tEnd", duration, score, features, reason, "createdAt", description, title, "aspectRatio", "targetPlatform") FROM stdin;
cmhlvszdj0000a7e3sf6tnyaq	cmhkud3e60001o2ja0f1kxss5	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 10:55:19.831	Dive into the heated debate on U.S. politics' impact on India! Discover why empathy is the key to leadership. Which party reigns supreme? Watch now!	Who's Better for India: GOP or Dems? 🤔🇮🇳	16:9	\N
cmhlvszdj0001a7e3sk8obl2y	cmhkud3e60001o2ja0f1kxss5	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 10:55:19.831	Dive into the heated debate at the Raisina Dialogue as we explore the impact of U.S. politics on India! Who will you support? Join the conversation!	Who's Better for India: Republicans or Democrats?	16:9	\N
cmhlvszdj0002a7e3va9pez6d	cmhkud3e60001o2ja0f1kxss5	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 10:55:19.831	Dive into the debate at the Raisina Dialogue! Discover how U.S. politics impacts India and why innovation needs fresh perspectives. Watch now!	Who's Better for India: Republicans or Democrats?	16:9	\N
cmhlyx6on000fpti4kzfezlz4	cmhlyx04b000cpti4xv2xvdm0	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 12:22:34.775	Think you can handle the telephone game? Watch as we take it to the next level! Join the fun and see if you can guess the message. Tag a friend to try this challenge!	The Ultimate Telephone Challenge: Can You Keep Up?	16:9	\N
cmhlyx6on000gpti4g36bdlrx	cmhlyx04b000cpti4xv2xvdm0	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 12:22:34.775	Ever wondered how a simple telephone changed the world? Discover the magic of communication in just 55 seconds! Don’t miss this fascinating insight!	The Power of Connection: A 55-Second Journey	16:9	\N
cmhlyx6on000hpti40o9n7kva	cmhlyx04b000cpti4xv2xvdm0	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 12:22:34.775	Get ready for a hilarious twist on the classic telephone game! Watch as this prank unfolds and leaves everyone in stitches. Can you guess the final message? Tune in!	The Ultimate Telephone Prank You Can't Miss! 📞😂	16:9	\N
cmhlzarm3000mpti4jd77eazc	cmhlzal6z000jpti4i2j1b3s8	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 12:33:08.428	Remember when cell phones were this big? 📞 Dive into a nostalgic journey as we showcase iconic phones from the past! Which one was your favorite? Let us know!	Blast from the Past: Vintage Cell Phones Unveiled!	16:9	\N
cmhlzarm3000npti4grxkhyuw	cmhlzal6z000jpti4i2j1b3s8	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 12:33:08.428	Take a trip down memory lane as we explore iconic cell phones from the past! Discover how far we've come in just a few decades. Which one was your favorite?	Blast from the Past: Retro Cell Phones Reimagined!	16:9	\N
cmhlzarm3000opti4fel9tdft	cmhlzal6z000jpti4i2j1b3s8	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 12:33:08.428	Take a trip down memory lane as we explore iconic cell phones from yesteryear! Discover how far we've come in just a few decades! Which one was your favorite?	Blast from the Past: Retro Cell Phones Unveiled!	16:9	\N
cmhlzcx2c000xpti40p6l2n6r	cmhlzchh0000upti4jkwreptl	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 12:34:48.803	Discover how Podmatch can transform your podcasting journey! Learn the key features and tips in this quick walkthrough. Ready to level up your podcast?	Unlock the Power of Podmatch in 55 Seconds!	16:9	\N
cmhlzcx2c000ypti4ihnz6j12	cmhlzchh0000upti4jkwreptl	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 12:34:48.803	Discover how to supercharge your podcasting journey with Podmatch! Connect with guests seamlessly and elevate your show. Ready to level up?	Unlock Networking Success with Podmatch!	16:9	\N
cmhlzcx2c000zpti4qbwfptjk	cmhlzchh0000upti4jkwreptl	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 12:34:48.803	Dive into Podmatch with our quick 55-second walkthrough! Discover how to connect with guests and elevate your podcasting game. Ready to level up? Watch now!	Unlocking Podmatch: Your Ultimate Podcast Tool!	16:9	\N
cmhlzqc3n001cpti4msv3ocp2	cmhlzq6u00019pti45p0v3td4	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 12:45:14.813	Discover the incredible story behind the invention of the telephone! From its origin to revolutionizing communication, you won't want to miss this. 📞💡 Watch now!	The Fascinating Journey of the Telephone 📞✨	16:9	\N
cmhlzqc3n001dpti4llra3pvh	cmhlzq6u00019pti45p0v3td4	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 12:45:14.813	Discover the fascinating history of the telephone in just 55 seconds! 📞 From invention to impact, this story will surprise you. Don't miss out!	The Unexpected Journey of the Telephone!	16:9	\N
cmhlzqc3n001epti4sckra6ww	cmhlzq6u00019pti45p0v3td4	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 12:45:14.813	Discover the fascinating journey of the telephone's invention! Uncover how one brilliant idea changed communication forever. Don't miss this quick dive into history!	The Surprising Story Behind the Telephone 📞✨	16:9	\N
cmhlzrc2x001jpti4v1ixwj67	cmhlzr6mo001gpti4tdqeynw8	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 12:46:01.449	Discover the enchanting glow of riverside light bulbs! 🌟 This 55-second clip will brighten your perspective. Don’t miss out—watch now!	Illuminate Your Day: Riverside Light Bulb Magic!	16:9	\N
cmhlzrc2x001kpti4i857zban	cmhlzr6mo001gpti4tdqeynw8	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 12:46:01.449	Transform your riverside space with stunning lighting! Discover creative ideas to brighten up your evenings by the water. Don’t miss out on these tips!	Illuminate Your Outdoors: Riverside Light Ideas!	16:9	\N
cmhlzrc2x001lpti43k3sw1wk	cmhlzr6mo001gpti4tdqeynw8	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 12:46:01.449	Join Gautam Raj Anand as he shares a burst of inspiration by the river! Discover new ideas and ignite your creativity. Don't miss out—watch now!	Light Bulb Moments by the Riverside! 💡✨	16:9	\N
cmhm00ehz001qpti4vu0wpdga	cmhm008gy001npti4mm7jbbxn	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 12:53:04.487	Discover how the telephone transformed our world in just 55 seconds! 📞✨ Dive into the history of communication and see why it still matters today. Don't miss out!	The Evolution of Communication: The Telephone Reel!	16:9	\N
cmhm00ehz001rpti4zrdlxkbw	cmhm008gy001npti4mm7jbbxn	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 12:53:04.487	Discover the incredible journey of the telephone in just 55 seconds! From Alexander Graham Bell to modern tech, witness history unfold. Don’t miss out!	The Fascinating Evolution of the Telephone! 📞✨	16:9	\N
cmhm00ehz001spti4rkw0z51i	cmhm008gy001npti4mm7jbbxn	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 12:53:04.487	Discover how the telephone transformed our world in less than a minute! 📞 Dive into the fascinating journey of communication. Don't miss this quick history lesson!	The Evolution of Communication in 55 Seconds!	16:9	\N
cmhm17x5t00048k23jr2l5dgc	cmhm17ro100018k236dtcye8o	10.5	65.5	55	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 13:26:54.882	Watch as this clever monkey showcases jaw-dropping skills! You'll be amazed by its intelligence and agility. Don’t miss out on this wild moment! 🐒✨	Unbelievable Monkey Skills You Need to See!	16:9	\N
cmhm17x5t00058k23dnrhjnu7	cmhm17ro100018k236dtcye8o	120	175	55	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 13:26:54.882	Get ready for a laugh! This monkey's playful shenanigans will brighten your day. Don’t miss out on the fun—hit like and share the joy!	Watch This Monkey’s Hilarious Antics! 🐒😂	16:9	\N
cmhm17x5t00068k232rj374ws	cmhm17ro100018k236dtcye8o	200	255	55	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 13:26:54.882	Get ready for some jaw-dropping monkey antics! These clever primates will leave you laughing and amazed. Don't forget to share your favorite moment!	Unbelievable Monkey Moments You Can’t Miss!	16:9	\N
cmhm3i5d90004vgs7geqm1on2	cmhm3hy2c0001vgs79730fa80	10.5	70.5	60	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 14:30:51.31	Experience heart-pounding excitement in just 60 seconds! Join the ride of a lifetime and feel the rush. Ready to scream? Buckle up and hit play! 🎢	Thrilling Rollercoaster Moments You Can’t Miss!	9:16	\N
cmhm3i5d90005vgs7u9e24yz0	cmhm3hy2c0001vgs79730fa80	120	180	60	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 14:30:51.31	Get ready for an adrenaline rush as we take you on a wild rollercoaster adventure! Buckle up and experience the twists and turns with us! Ready for the ride? 🌟	Feel the Thrill: Epic Rollercoaster Ride! 🎢	9:16	\N
cmhm3i5d90006vgs78mw6okra	cmhm3hy2c0001vgs79730fa80	200	260	60	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 14:30:51.31	Experience the heart-pounding excitement of a rollercoaster in just 60 seconds! Hold on tight and get ready for the ultimate adrenaline rush! 🎢✨	Thrilling Rollercoaster Ride: Feel the Rush!	9:16	\N
cmhm4ba7x000bvgs7qobknko5	cmhm4b42z0008vgs70vsnq5lk	10.5	55.5	45	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 14:53:30.622	Discover how the telephone transformed communication! From Alexander Graham Bell to smartphones, see the journey in just 45 seconds! Don't miss out!	The Fascinating Evolution of the Telephone!	9:16	youtube-shorts
cmhm4ba7x000cvgs73rsy3nxa	cmhm4b42z0008vgs70vsnq5lk	120	165	45	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 14:53:30.622	Discover how the telephone transformed communication! From its invention to today's smart devices, this clip covers it all. Ready to dial into history?	The Evolution of the Telephone in 45 Seconds!	9:16	youtube-shorts
cmhm4ba7x000dvgs7a20axnka	cmhm4b42z0008vgs70vsnq5lk	200	245	45	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 14:53:30.622	Discover how the telephone transformed communication forever! From Alexander Graham Bell to smartphones, this journey will amaze you! Don't miss out!	The Amazing Evolution of the Telephone! 📞✨	9:16	youtube-shorts
cmhm4dynf000ivgs7a4xm1nmi	cmhm4dsl2000fvgs7lt3wrkz0	10.5	55.5	45	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 14:55:35.595	Discover how to ignite your creativity and transform ideas into action! Join Gautam Raj Anand in this energizing clip. Ready to spark your imagination? Watch now!	Unleashing the Power of Creativity in 45 Seconds!	9:16	youtube-shorts
cmhm4dynf000jvgs7feopk15e	cmhm4dsl2000fvgs7lt3wrkz0	120	165	45	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 14:55:35.595	Discover the surprising journey of innovation in just 45 seconds! Join Gautam Raj Anand as he sparks a revolution. Don't miss out—watch now!	Illuminate Your Mind: The Fight Against Bulbs!	9:16	youtube-shorts
cmhm4dynf000kvgs7djq2pjm9	cmhm4dsl2000fvgs7lt3wrkz0	200	245	45	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 14:55:35.595	Discover the groundbreaking Fight Bulb concept in just 45 seconds! Witness innovation that inspires and energizes. Ready to change the game? 🌟✨	Unleashing the Power of the Fight Bulb!	9:16	youtube-shorts
cmhm4grlf000pvgs79byi8657	cmhm4gihl000mvgs7qt7ilky0	10.5	30.5	20	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 14:57:46.419	Discover the magic of Gautam Raj Anand's lighter in just 20 seconds! 🔥 Ready to spark your creativity? Watch now and ignite your passion!	Light Up Your Life with Gautam Raj Anand!	16:9	\N
cmhm4grlf000qvgs70i50yzo6	cmhm4gihl000mvgs7qt7ilky0	120	140	20	87	{"hook": 0.7, "quote": 0.5, "clarity": 0.8, "emotion": 0.6, "novelty": 0.85, "structure": 0.95, "vision_focus": 0.65}	Well-structured • Novel	2025-11-05 14:57:46.419	Watch as Gautam Raj Anand pulls off an incredible lighter trick that will leave you amazed! Can you guess how he does it? 🔥✨ Don’t miss out—hit that like and share!	The Magic of Gautam Raj Anand's Lighter Trick!	16:9	\N
cmhm4grlf000rvgs7y8gjuupu	cmhm4gihl000mvgs7qt7ilky0	200	220	20	81	{"hook": 0.65, "quote": 0.55, "clarity": 0.85, "emotion": 0.6, "novelty": 0.9, "structure": 0.75, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 14:57:46.419	Watch as Gautam Raj Anand turns a simple lighter into a captivating spectacle! You won't believe your eyes! 🔥 Don't miss this mesmerizing moment!	The Magic of Gautam Raj Anand's Lighter Trick!	16:9	\N
cmhm57o2o0004801c09oot4g2	cmhm57hvz0001801cqfe1ox6m	10	70	60	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 15:18:41.568	Discover the stunning transformation brought by the Riverside light bulb! Watch as creativity meets innovation in just 60 seconds. Don't miss out—light up your ideas!	Illuminate Your World: The Riverside Light Bulb Magic!	16:9	\N
cmhm57o2o0005801cwyxqy2lo	cmhm57hvz0001801cqfe1ox6m	80	140	60	89	{"hook": 0.85, "quote": 0.6, "clarity": 0.75, "emotion": 0.7999999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Well-structured • Novel	2025-11-05 15:18:41.568	Discover how a simple light bulb can transform your riverside experience! Join us for a minute of inspiration and creativity. Ready to brighten your day? ✨ #LightingMagic	Illuminate Your Life: Riverside Light Bulb Magic!	16:9	\N
cmhm57o2o0006801ck1hq83d7	cmhm57hvz0001801cqfe1ox6m	150	210	60	86	{"hook": 0.8, "quote": 0.6, "clarity": 0.75, "emotion": 0.75, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 15:18:41.568	Discover how a simple light bulb can transform your riverside moments! Join us for a 60-second journey of creativity and inspiration. Don’t miss out!	Bright Ideas: Illuminate Your Riverside Experience!	16:9	\N
cmhm58r01000b801cry56x69q	cmhm58hcl0008801ctsqz13zx	10	40	30	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-05 15:19:32.017	Discover the enchanting beauty of riverside lights! 🌟 Uncover the serene vibes and let the glow inspire your next adventure. Dive in and illuminate your world!	Light Up Your Life: Riverside Magic Awaits!	9:16	youtube-shorts
cmhm58r01000c801cc58w8hl6	cmhm58hcl0008801ctsqz13zx	50	80	30	89	{"hook": 0.85, "quote": 0.6, "clarity": 0.75, "emotion": 0.7999999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Well-structured • Novel	2025-11-05 15:19:32.017	Discover the stunning transformation of light with Riverside's innovative bulb! Brighten your space and elevate your mood. Ready to shine? 🌟 #LightingRevolution	Illuminate Your World: Riverside Light Bulb Magic!	9:16	youtube-shorts
cmhm58r01000d801cxw7033s7	cmhm58hcl0008801ctsqz13zx	90	120	30	86	{"hook": 0.8, "quote": 0.6, "clarity": 0.75, "emotion": 0.75, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Novel content • Clarity	2025-11-05 15:19:32.017	Discover the brilliance of Riverside Light Bulb! 🛋️💡 Transform your space in just 30 seconds. Ready to brighten your day? Watch now!	Illuminate Your World with Riverside Light Bulb!	9:16	youtube-shorts
cmhm58r01000e801cpwnxnkp9	cmhm58hcl0008801ctsqz13zx	130	160	30	83	{"hook": 0.75, "quote": 0.6, "clarity": 0.75, "emotion": 0.7, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Engaging story • Clear	2025-11-05 15:19:32.017	Discover the enchanting beauty of Riverside's lights in just 30 seconds! Dive into this mesmerizing visual journey—don't miss the glow! ✨ #RiversideMagic	Illuminate Your World: Riverside Light Magic!	9:16	youtube-shorts
cmhm58r01000f801cd9gmyj2j	cmhm58hcl0008801ctsqz13zx	170	200	30	80	{"hook": 0.7, "quote": 0.6, "clarity": 0.75, "emotion": 0.6499999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Emotional impact • Hook	2025-11-05 15:19:32.017	Discover the enchanting glow of Riverside's latest light bulb design! Transform your space with style and innovation. Don't miss this brilliance! ✨💡	Illuminate Your Path: Riverside Light Magic!	9:16	youtube-shorts
cmhm58r01000g801cvkpt40a3	cmhm58hcl0008801ctsqz13zx	210	240	30	77	{"hook": 0.65, "quote": 0.6, "clarity": 0.75, "emotion": 0.6, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Great pacing • Structure	2025-11-05 15:19:32.017	Discover the enchanting glow of Riverside's latest light bulb innovation! Transform your space effortlessly. Ready to brighten your day? 🌟✨	Illuminate Your World: Riverside Light Bulb Magic!	9:16	youtube-shorts
cmhm58r01000h801ct0y1p9fu	cmhm58hcl0008801ctsqz13zx	250	280	30	74	{"hook": 0.6, "quote": 0.6, "clarity": 0.75, "emotion": 0.5499999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Compelling narrative	2025-11-05 15:19:32.017	Discover the enchanting charm of Riverside's light bulb! In just 30 seconds, see how it transforms ordinary spaces into extraordinary experiences. Don't miss out—watch now!	Illuminate Your World: Riverside Light Bulb Magic!	9:16	youtube-shorts
cmhn8qulr000s801conk7sdcn	cmhn8qlpm000p801c8qquitam	10	70	60	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-06 09:45:21.519	Join a heartfelt conversation between a boy and a man, exploring life’s lessons and perspectives. Discover what wisdom truly means! What would you ask?	57 Years Apart: Wisdom Across Generations	16:9	\N
cmhn8qulr000t801ctqwocn88	cmhn8qlpm000p801c8qquitam	80	140	60	89	{"hook": 0.85, "quote": 0.6, "clarity": 0.75, "emotion": 0.7999999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Well-structured • Novel	2025-11-06 09:45:21.519	Discover the powerful insights shared between a boy and a man 57 years apart! Their heartfelt conversation reveals timeless lessons on life. Watch now and reflect!	57 Years Apart: Wisdom Across Generations	16:9	\N
cmhn8qulr000u801caqrj0grm	cmhn8qlpm000p801c8qquitam	150	210	60	86	{"hook": 0.8, "quote": 0.6, "clarity": 0.75, "emotion": 0.75, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Novel content • Clarity	2025-11-06 09:45:21.519	Discover the powerful insights shared between a boy and a man separated by 57 years! Their conversation reveals timeless lessons on life. What wisdom do you cherish?	Wisdom Through Generations: 57 Years Apart	16:9	\N
cmhn8xeat0013801cgo4pdeu5	cmhn8x4vk0010801cjzgwnmds	10	40	30	92	{"hook": 0.9, "quote": 0.6, "clarity": 0.75, "emotion": 0.85, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Strong hook • Emotional	2025-11-06 09:50:26.981	Discover how life evolves over nearly six decades! From technology to culture, see what has changed and what remains timeless. What's your favorite change?	57 Years of Change: Life's Surprising Transformations	9:16	\N
cmhn8xeat0014801cmzgmync3	cmhn8x4vk0010801cjzgwnmds	50	80	30	89	{"hook": 0.85, "quote": 0.6, "clarity": 0.75, "emotion": 0.7999999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Well-structured • Novel	2025-11-06 09:50:26.981	Discover how life evolves in just 57 years! From fashion to tech, watch the incredible transformation unfold. What changes have shaped your journey?	Life's Changes: 57 Years in 30 Seconds!	9:16	\N
cmhn8xeat0015801c95ims6vk	cmhn8x4vk0010801cjzgwnmds	90	120	30	86	{"hook": 0.8, "quote": 0.6, "clarity": 0.75, "emotion": 0.75, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Novel content • Clarity	2025-11-06 09:50:26.981	Discover the incredible transformations life brings in just 57 years! From dreams to realities, witness the journey of change. What surprises await you?	57 Years Apart: How Life Changes Over Time	9:16	\N
cmhn8xeat0016801cfoykdjaa	cmhn8x4vk0010801cjzgwnmds	130	160	30	83	{"hook": 0.75, "quote": 0.6, "clarity": 0.75, "emotion": 0.7, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Engaging story • Clear	2025-11-06 09:50:26.981	Discover how life evolves over nearly six decades! This short clip highlights the incredible transformations we experience. What’s changed for you? Share in the comments!	57 Years Apart: Life's Surprising Changes!	9:16	\N
cmhn8xeat0017801cp4bg2wd0	cmhn8x4vk0010801cjzgwnmds	170	200	30	80	{"hook": 0.7, "quote": 0.6, "clarity": 0.75, "emotion": 0.6499999999999999, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Emotional impact • Hook	2025-11-06 09:50:26.981	Witness how life evolves in just 30 seconds! From fashion to technology, see the stunning transformations over 57 years. What changes surprised you most?	57 Years of Change: A Life in 30 Seconds!	9:16	\N
cmhn8xeat0018801cp805hjz6	cmhn8x4vk0010801cjzgwnmds	210	240	30	77	{"hook": 0.65, "quote": 0.6, "clarity": 0.75, "emotion": 0.6, "novelty": 0.7, "structure": 0.8, "vision_focus": 0.7}	Great pacing • Structure	2025-11-06 09:50:26.981	Discover the incredible transformations life brings over 57 years! From trends to milestones, witness the journey of change. What surprises you most?	Life's Changes: 57 Years in 30 Seconds!	9:16	\N
\.


--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Organization" (id, name, "createdAt", "updatedAt") FROM stdin;
cmhkskrsl0004jt1dnwsoevzq	Demo User's Organization	2025-11-04 16:37:11.733	2025-11-04 16:37:11.733
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Project" (id, "orgId", title, "sourceUrl", status, "createdAt", "updatedAt", "clipSettings") FROM stdin;
cmhm008gy001npti4mm7jbbxn	cmhkskrsl0004jt1dnwsoevzq	The Telephone Real reload	projects/cmhm008gy001npti4mm7jbbxn/source.mp4	READY	2025-11-05 12:52:56.675	2025-11-05 13:24:46.524	\N
cmhm17ro100018k236dtcye8o	cmhkskrsl0004jt1dnwsoevzq	monkeyclip friends	projects/cmhm17ro100018k236dtcye8o/source.mp4	READY	2025-11-05 13:26:47.761	2025-11-05 13:31:30.069	\N
cmhm3hy2c0001vgs79730fa80	cmhkskrsl0004jt1dnwsoevzq	rollercoaster	projects/cmhm3hy2c0001vgs79730fa80/source.mp4	READY	2025-11-05 14:30:41.844	2025-11-05 14:30:51.314	{"clipLength": 60, "aspectRatio": "9:16", "numberOfClips": 5}
cmhm4b42z0008vgs70vsnq5lk	cmhkskrsl0004jt1dnwsoevzq	Talking about the telephone and how	projects/cmhm4b42z0008vgs70vsnq5lk/source.mp4	READY	2025-11-05 14:53:22.668	2025-11-05 14:53:30.627	{"clipLength": 45, "aspectRatio": "9:16", "numberOfClips": 7, "targetPlatform": "youtube-shorts"}
cmhm4dsl2000fvgs7lt3wrkz0	cmhkskrsl0004jt1dnwsoevzq	fight_bulb reel final _ aug 9, 2024 001_gautam_raj anand's 	projects/cmhm4dsl2000fvgs7lt3wrkz0/source.mp4	READY	2025-11-05 14:55:27.735	2025-11-05 14:55:35.602	{"clipLength": 45, "aspectRatio": "9:16", "numberOfClips": 5, "targetPlatform": "youtube-shorts"}
cmhm4gihl000mvgs7qt7ilky0	cmhkskrsl0004jt1dnwsoevzq	gautam_raj anand lighter 	projects/cmhm4gihl000mvgs7qt7ilky0/source.mp4	READY	2025-11-05 14:57:34.617	2025-11-05 14:57:46.425	{"clipLength": 20, "aspectRatio": "16:9", "numberOfClips": 6}
cmhm57hvz0001801cqfe1ox6m	cmhkskrsl0004jt1dnwsoevzq	riverside_light_bulb reel final _ aug 9, 2024 001_gautam_raj anand's 	projects/cmhm57hvz0001801cqfe1ox6m/source.mp4	READY	2025-11-05 15:18:33.549	2025-11-05 15:18:41.574	{"clipLength": 60, "aspectRatio": "16:9", "numberOfClips": 3}
cmhkud3e60001o2ja0f1kxss5	cmhkskrsl0004jt1dnwsoevzq	EP-49 | Republicans or Democrats_ Who is better for India? (Raisina Dialogue) @ORFDelhi	\N	READY	2025-11-04 17:27:12.75	2025-11-05 10:55:19.833	\N
cmhlx6t0z00017tn2pvb1mdcm	cmhkskrsl0004jt1dnwsoevzq	KEVIN HART ON_ The SECRET To Success & Happiness NOBODY TALKS ABOUT (Do This In 2023) _ Jay Shetty	projects/cmhlx6t0z00017tn2pvb1mdcm/source.mp4	DETECTING	2025-11-05 11:34:04.403	2025-11-05 11:34:06.448	\N
cmhm58hcl0008801ctsqz13zx	cmhkskrsl0004jt1dnwsoevzq	riverside_light_bulb reel final _ aug 9, 2024 001_gautam_raj anand's 	projects/cmhm58hcl0008801ctsqz13zx/source.mp4	READY	2025-11-05 15:19:19.509	2025-11-05 15:19:32.023	{"clipLength": 30, "aspectRatio": "9:16", "numberOfClips": 7, "targetPlatform": "youtube-shorts"}
cmhn8qlpm000p801c8qquitam	cmhkskrsl0004jt1dnwsoevzq	57 Years Apart - A Boy And a Man Talk About Life	projects/cmhn8qlpm000p801c8qquitam/source.mp4	READY	2025-11-06 09:45:09.994	2025-11-06 09:45:21.551	{"clipLength": 60, "aspectRatio": "16:9", "numberOfClips": 3}
cmhlyx04b000cpti4xv2xvdm0	cmhkskrsl0004jt1dnwsoevzq	Telephone 	projects/cmhlyx04b000cpti4xv2xvdm0/source.mp4	READY	2025-11-05 12:22:26.267	2025-11-05 12:22:34.782	\N
cmhlzal6z000jpti4i2j1b3s8	cmhkskrsl0004jt1dnwsoevzq	Cell phone from the past	projects/cmhlzal6z000jpti4i2j1b3s8/source.mp4	READY	2025-11-05 12:33:00.107	2025-11-05 12:33:08.441	\N
cmhn8x4vk0010801cjzgwnmds	cmhkskrsl0004jt1dnwsoevzq	57 Years Apart - The things that change in life	projects/cmhn8x4vk0010801cjzgwnmds/source.mp4	READY	2025-11-06 09:50:14.768	2025-11-06 09:50:26.988	{"clipLength": 30, "aspectRatio": "9:16", "numberOfClips": 6}
cmhlzchh0000upti4jkwreptl	cmhkskrsl0004jt1dnwsoevzq	Podmatch walkthrough	projects/cmhlzchh0000upti4jkwreptl/source.mp4	READY	2025-11-05 12:34:28.597	2025-11-05 12:34:48.811	\N
cmhlzq6u00019pti45p0v3td4	cmhkskrsl0004jt1dnwsoevzq	The Telephone Story	projects/cmhlzq6u00019pti45p0v3td4/source.mp4	READY	2025-11-05 12:45:07.992	2025-11-05 12:45:14.841	\N
cmhlzr6mo001gpti4tdqeynw8	cmhkskrsl0004jt1dnwsoevzq	riverside_light_bulb reel final _ aug 9, 2024 001_gautam_raj anand's 	projects/cmhlzr6mo001gpti4tdqeynw8/source.mp4	READY	2025-11-05 12:45:54.384	2025-11-05 12:46:01.455	\N
\.


--
-- Data for Name: Transcript; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Transcript" (id, "projectId", language, data, "createdAt") FROM stdin;
test_transcript_001	cmhkud3e60001o2ja0f1kxss5	en	{"words": [{"end": 10.7, "text": "The", "start": 10.5}, {"end": 10.9, "text": "most", "start": 10.7}, {"end": 11.3, "text": "important", "start": 10.9}, {"end": 11.5, "text": "thing", "start": 11.3}, {"end": 11.7, "text": "about", "start": 11.5}, {"end": 12.2, "text": "leadership", "start": 11.7}, {"end": 12.3, "text": "is", "start": 12.2}, {"end": 12.8, "text": "empathy.", "start": 12.3}, {"end": 13.1, "text": "You", "start": 13.0}, {"end": 13.3, "text": "need", "start": 13.1}, {"end": 13.4, "text": "to", "start": 13.3}, {"end": 13.9, "text": "understand", "start": 13.4}, {"end": 14.0, "text": "your", "start": 13.9}, {"end": 14.3, "text": "team.", "start": 14.0}, {"end": 120.2, "text": "When", "start": 120.0}, {"end": 120.3, "text": "you", "start": 120.2}, {"end": 120.6, "text": "break", "start": 120.3}, {"end": 120.8, "text": "down", "start": 120.6}, {"end": 121.2, "text": "complex", "start": 120.8}, {"end": 121.5, "text": "ideas", "start": 121.2}, {"end": 121.9, "text": "simply,", "start": 121.5}, {"end": 122.4, "text": "everyone", "start": 122.0}, {"end": 123.0, "text": "understands.", "start": 122.4}, {"end": 200.5, "text": "Innovation", "start": 200.0}, {"end": 200.9, "text": "requires", "start": 200.5}, {"end": 201.0, "text": "a", "start": 200.9}, {"end": 201.3, "text": "fresh", "start": 201.0}, {"end": 201.9, "text": "perspective", "start": 201.3}, {"end": 202.0, "text": "on", "start": 201.9}, {"end": 202.3, "text": "common", "start": 202.0}, {"end": 202.9, "text": "challenges.", "start": 202.3}]}	2025-11-05 10:48:52.047
\.


--
-- Data for Name: UsageLedger; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."UsageLedger" (id, "orgId", "minutesProcessed", "exportsCount", period, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."User" (id, email, name, password, "createdAt", "updatedAt") FROM stdin;
cmhkskrsl0000jt1dz6xll1zq	demo@clipforge.dev	Demo User	$2b$10$1brd2mcTqbmOXVGEdxuUBOx.xK.MyhJK4X9Qb7L9WVupiH8bo1yZi	2025-11-04 16:37:11.733	2025-11-04 16:37:11.733
\.


--
-- Data for Name: Webhook; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public."Webhook" (id, "orgId", "userId", url, secret, events, active, "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: clipforge
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
58eefd32-127f-4098-be05-0c819be1dd15	483ce87ca44107cab6e6b4ae14ea81ee845abe2142fab50cf70b57840e5fdd9a	2025-11-04 16:35:48.561642+00	20251104163548_init	\N	\N	2025-11-04 16:35:48.506392+00	1
ce3baf0e-c90b-4e3e-a671-922f719ce539	94add9244ade8b8b999b14a71fed40ce862fd853aeb92ac2da0d3750296e862b	2025-11-05 10:03:11.572626+00	20251105100311_add_title_description_to_moments	\N	\N	2025-11-05 10:03:11.568921+00	1
ca148ecf-3713-4c80-83d8-2897124495ba	c1fa9956fc664c9cffc0829a8cbe65d5f4d5fbb2ca5ffb4a65d261c82860d446	2025-11-05 13:57:04.295861+00	20251105135704_add_clip_customization_fields	\N	\N	2025-11-05 13:57:04.292502+00	1
\.


--
-- Name: ApiKey ApiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: BrandKit BrandKit_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."BrandKit"
    ADD CONSTRAINT "BrandKit_pkey" PRIMARY KEY (id);


--
-- Name: Export Export_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Export"
    ADD CONSTRAINT "Export_pkey" PRIMARY KEY (id);


--
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY (id);


--
-- Name: Membership Membership_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_pkey" PRIMARY KEY (id);


--
-- Name: Moment Moment_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Moment"
    ADD CONSTRAINT "Moment_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Transcript Transcript_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Transcript"
    ADD CONSTRAINT "Transcript_pkey" PRIMARY KEY (id);


--
-- Name: UsageLedger UsageLedger_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."UsageLedger"
    ADD CONSTRAINT "UsageLedger_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Webhook Webhook_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Webhook"
    ADD CONSTRAINT "Webhook_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ApiKey_keyHash_key; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON public."ApiKey" USING btree ("keyHash");


--
-- Name: ApiKey_orgId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "ApiKey_orgId_idx" ON public."ApiKey" USING btree ("orgId");


--
-- Name: ApiKey_userId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "ApiKey_userId_idx" ON public."ApiKey" USING btree ("userId");


--
-- Name: Asset_kind_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Asset_kind_idx" ON public."Asset" USING btree (kind);


--
-- Name: Asset_projectId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Asset_projectId_idx" ON public."Asset" USING btree ("projectId");


--
-- Name: BrandKit_orgId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "BrandKit_orgId_idx" ON public."BrandKit" USING btree ("orgId");


--
-- Name: Export_momentId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Export_momentId_idx" ON public."Export" USING btree ("momentId");


--
-- Name: Export_projectId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Export_projectId_idx" ON public."Export" USING btree ("projectId");


--
-- Name: Export_status_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Export_status_idx" ON public."Export" USING btree (status);


--
-- Name: Job_projectId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Job_projectId_idx" ON public."Job" USING btree ("projectId");


--
-- Name: Job_status_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Job_status_idx" ON public."Job" USING btree (status);


--
-- Name: Job_type_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Job_type_idx" ON public."Job" USING btree (type);


--
-- Name: Membership_orgId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Membership_orgId_idx" ON public."Membership" USING btree ("orgId");


--
-- Name: Membership_orgId_userId_key; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE UNIQUE INDEX "Membership_orgId_userId_key" ON public."Membership" USING btree ("orgId", "userId");


--
-- Name: Membership_userId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Membership_userId_idx" ON public."Membership" USING btree ("userId");


--
-- Name: Moment_projectId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Moment_projectId_idx" ON public."Moment" USING btree ("projectId");


--
-- Name: Moment_score_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Moment_score_idx" ON public."Moment" USING btree (score);


--
-- Name: Organization_name_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Organization_name_idx" ON public."Organization" USING btree (name);


--
-- Name: Project_orgId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Project_orgId_idx" ON public."Project" USING btree ("orgId");


--
-- Name: Project_status_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Project_status_idx" ON public."Project" USING btree (status);


--
-- Name: Transcript_projectId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Transcript_projectId_idx" ON public."Transcript" USING btree ("projectId");


--
-- Name: Transcript_projectId_key; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE UNIQUE INDEX "Transcript_projectId_key" ON public."Transcript" USING btree ("projectId");


--
-- Name: UsageLedger_orgId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "UsageLedger_orgId_idx" ON public."UsageLedger" USING btree ("orgId");


--
-- Name: UsageLedger_orgId_period_key; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE UNIQUE INDEX "UsageLedger_orgId_period_key" ON public."UsageLedger" USING btree ("orgId", period);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Webhook_orgId_idx; Type: INDEX; Schema: public; Owner: clipforge
--

CREATE INDEX "Webhook_orgId_idx" ON public."Webhook" USING btree ("orgId");


--
-- Name: ApiKey ApiKey_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ApiKey ApiKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Asset Asset_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BrandKit BrandKit_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."BrandKit"
    ADD CONSTRAINT "BrandKit_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Export Export_momentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Export"
    ADD CONSTRAINT "Export_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES public."Moment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Export Export_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Export"
    ADD CONSTRAINT "Export_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Moment Moment_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Moment"
    ADD CONSTRAINT "Moment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transcript Transcript_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Transcript"
    ADD CONSTRAINT "Transcript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UsageLedger UsageLedger_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."UsageLedger"
    ADD CONSTRAINT "UsageLedger_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Webhook Webhook_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Webhook"
    ADD CONSTRAINT "Webhook_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Webhook Webhook_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clipforge
--

ALTER TABLE ONLY public."Webhook"
    ADD CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xjlDoIpGEVluiaLe2zx2mngU91qIsfYTxpLCknsArhKqAVMNWMR8KP0AEcX4Jmh

