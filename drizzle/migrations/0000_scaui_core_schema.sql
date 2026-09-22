-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('super_admin','admin','team_lead','member');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  birthday date,
  gender text,
  faculty text,
  department text,
  level text,
  bio text,
  avatar_url text,
  interests text[] NOT NULL DEFAULT '{}',
  current_track text,
  expectations text,
  willing_to_volunteer boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  must_change_password boolean NOT NULL DEFAULT false,
  birthday_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_lead(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('team_lead','admin','super_admin'))
$$;

CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "roles readable" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- ============ MEMBER ROSTER (pre-imported, pre-signup) ============
CREATE TABLE public.member_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  birthday date,
  gender text,
  faculty text,
  department text,
  level text,
  current_track text,
  interests text[] NOT NULL DEFAULT '{}',
  expectations text,
  willing_to_volunteer boolean NOT NULL DEFAULT false,
  preferred_team text,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_records TO authenticated;
GRANT ALL ON public.member_records TO service_role;
ALTER TABLE public.member_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roster staff read" ON public.member_records FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ============ TRACKS ============
CREATE TABLE public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  cluster text NOT NULL,
  description text,
  lead_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tracks TO anon, authenticated;
GRANT ALL ON public.tracks TO service_role;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracks public read" ON public.tracks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tracks staff write" ON public.tracks FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.track_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  level text NOT NULL DEFAULT 'beginner',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (track_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.track_members TO authenticated;
GRANT ALL ON public.track_members TO service_role;
ALTER TABLE public.track_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "track members read" ON public.track_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "track members self join" ON public.track_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "track members self leave" ON public.track_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- ============ TEAMS ============
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  lead_id uuid,
  open_positions int NOT NULL DEFAULT 0,
  is_recruiting boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teams TO anon, authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams public read" ON public.teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "teams staff write" ON public.teams FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.team_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  motivation text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.team_applications TO authenticated;
GRANT ALL ON public.team_applications TO service_role;
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team apps read" ON public.team_applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "team apps insert" ON public.team_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "team apps update" ON public.team_applications FOR UPDATE TO authenticated USING (public.is_lead(auth.uid()));

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_title text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team members read" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "team members staff write" ON public.team_members FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ EVENTS ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'meetup',
  location text,
  is_online boolean NOT NULL DEFAULT false,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  capacity int,
  cover_url text,
  resources_url text,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_lead(auth.uid()));
CREATE POLICY "events lead write" ON public.events FOR ALL TO authenticated USING (public.is_lead(auth.uid())) WITH CHECK (public.is_lead(auth.uid()));

CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  qr_token text NOT NULL DEFAULT encode(gen_random_bytes(12),'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regs read" ON public.event_registrations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "regs insert" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "regs delete" ON public.event_registrations FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "regs update" ON public.event_registrations FOR UPDATE TO authenticated USING (public.is_lead(auth.uid()));

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL DEFAULT 'event',
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  programme_id uuid,
  project_id uuid,
  title text NOT NULL,
  method text NOT NULL DEFAULT 'manual',
  recorded_by uuid,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance read" ON public.attendance FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "attendance lead write" ON public.attendance FOR INSERT TO authenticated WITH CHECK (public.is_lead(auth.uid()));
CREATE POLICY "attendance lead delete" ON public.attendance FOR DELETE TO authenticated USING (public.is_lead(auth.uid()));

CREATE TABLE public.event_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating int NOT NULL DEFAULT 5,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT ON public.event_feedback TO authenticated;
GRANT ALL ON public.event_feedback TO service_role;
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback read" ON public.event_feedback FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "feedback insert" ON public.event_feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============ PROGRAMMES ============
CREATE TABLE public.programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'training',
  facilitators text,
  eligibility text,
  starts_on date,
  ends_on date,
  cover_url text,
  status text NOT NULL DEFAULT 'draft',
  applications_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programmes TO anon, authenticated;
GRANT ALL ON public.programmes TO service_role;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programmes public read" ON public.programmes FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_lead(auth.uid()));
CREATE POLICY "programmes lead write" ON public.programmes FOR ALL TO authenticated USING (public.is_lead(auth.uid())) WITH CHECK (public.is_lead(auth.uid()));

CREATE TABLE public.programme_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  motivation text,
  status text NOT NULL DEFAULT 'pending',
  completed boolean NOT NULL DEFAULT false,
  certificate_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.programme_applications TO authenticated;
GRANT ALL ON public.programme_applications TO service_role;
ALTER TABLE public.programme_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prog apps read" ON public.programme_applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "prog apps insert" ON public.programme_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "prog apps update" ON public.programme_applications FOR UPDATE TO authenticated USING (public.is_lead(auth.uid()));

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  description text,
  lead_id uuid,
  open_roles text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  showcase_url text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT TO anon, authenticated USING (status <> 'draft' OR public.is_lead(auth.uid()));
CREATE POLICY "projects lead write" ON public.projects FOR ALL TO authenticated USING (public.is_lead(auth.uid())) WITH CHECK (public.is_lead(auth.uid()));

CREATE TABLE public.project_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_applied text,
  motivation text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.project_applications TO authenticated;
GRANT ALL ON public.project_applications TO service_role;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proj apps read" ON public.project_applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_lead(auth.uid()));
CREATE POLICY "proj apps insert" ON public.project_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "proj apps update" ON public.project_applications FOR UPDATE TO authenticated USING (public.is_lead(auth.uid()));

CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role_title text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
GRANT SELECT ON public.project_members TO anon, authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proj members read" ON public.project_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "proj members lead write" ON public.project_members FOR ALL TO authenticated USING (public.is_lead(auth.uid())) WITH CHECK (public.is_lead(auth.uid()));

-- ============ OPPORTUNITIES ============
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organisation text,
  category text NOT NULL DEFAULT 'internship',
  description text,
  eligibility text,
  location text,
  is_remote boolean NOT NULL DEFAULT false,
  apply_url text,
  deadline date,
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  clicks int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunities TO anon, authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opps public read" ON public.opportunities FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_lead(auth.uid()));
CREATE POLICY "opps lead write" ON public.opportunities FOR ALL TO authenticated USING (public.is_lead(auth.uid())) WITH CHECK (public.is_lead(auth.uid()));

CREATE TABLE public.opportunity_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.opportunity_bookmarks TO authenticated;
GRANT ALL ON public.opportunity_bookmarks TO service_role;
ALTER TABLE public.opportunity_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks own" ON public.opportunity_bookmarks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ NEWSLETTER / CONTACT / SPOTLIGHT / CMS ============
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  segment text NOT NULL DEFAULT 'general',
  subscribed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribe open" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "subs staff read" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "subs staff write" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text,
  segment text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletters TO authenticated;
GRANT ALL ON public.newsletters TO service_role;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletters staff" ON public.newsletters FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  category text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact open insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact staff read" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "contact staff update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.spotlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  title text NOT NULL,
  story text,
  photo_url text,
  achievements text,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spotlights TO anon, authenticated;
GRANT ALL ON public.spotlights TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.spotlights TO authenticated;
ALTER TABLE public.spotlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spotlights public read" ON public.spotlights FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "spotlights staff write" ON public.spotlights FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  audience text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements read" ON public.announcements FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "announcements staff write" ON public.announcements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ PARTNERS / NOTIFICATIONS / AUDIT ============
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact_name text,
  email text,
  phone text,
  partnership_type text,
  status text NOT NULL DEFAULT 'prospect',
  value_naira numeric,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners staff" ON public.partners FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit staff read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ============ ENGAGEMENT VIEW ============
CREATE OR REPLACE VIEW public.member_engagement
WITH (security_invoker = true) AS
SELECT p.id AS user_id, p.full_name, p.email,
       COUNT(a.id) AS activities,
       (COUNT(a.id) >= 5) AS is_active_member
FROM public.profiles p
LEFT JOIN public.attendance a ON a.user_id = p.id
GROUP BY p.id, p.full_name, p.email;
GRANT SELECT ON public.member_engagement TO authenticated;

-- ============ SEED TRACKS & TEAMS ============
INSERT INTO public.tracks (name, cluster, description) VALUES
 ('Graphics Design','Design','Visual identity, brand and social design'),
 ('UI/UX','Design','Product design, research and prototyping'),
 ('Frontend','Software Engineering','Web interfaces with modern frameworks'),
 ('Backend','Software Engineering','APIs, databases and server logic'),
 ('Mobile','Software Engineering','Android, iOS and cross-platform apps'),
 ('Data Analysis','Data & AI','Spreadsheets, SQL and dashboards'),
 ('Data Science','Data & AI','Statistics, modelling and storytelling'),
 ('AI/ML','Data & AI','Machine learning and applied AI'),
 ('Product Management','Product & Business','Discovery, roadmaps and delivery'),
 ('Project Management','Product & Business','Planning, execution and reporting'),
 ('Marketing','Product & Business','Growth, content and community marketing'),
 ('Cybersecurity','Emerging Tech','Security fundamentals and defence'),
 ('Blockchain','Emerging Tech','Web3 and distributed systems');

INSERT INTO public.teams (name, description) VALUES
 ('Programs Team','Plans and runs SCAUI events and programmes'),
 ('Design Team','Owns visual identity, flyers and product design'),
 ('Content Team','Writes stories, newsletters and documentation'),
 ('Publicity Team','Social media, outreach and community growth'),
 ('Welfare Team','Member care, birthdays and community wellbeing'),
 ('Sponsorship Team','Partnerships, sponsors and fundraising'),
 ('Technical/Tracks Team','Runs learning tracks and technical sessions'),
 ('Community Operations','Data, tools and day-to-day operations');