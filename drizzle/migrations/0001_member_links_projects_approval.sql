-- Profile links
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS behance_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Member-submitted work
CREATE TABLE IF NOT EXISTS public.member_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  project_url TEXT,
  repo_url TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_projects TO authenticated;
GRANT SELECT ON public.member_projects TO anon;
GRANT ALL ON public.member_projects TO service_role;

ALTER TABLE public.member_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_projects public read"
  ON public.member_projects FOR SELECT
  USING (is_public OR auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "member_projects own insert"
  ON public.member_projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "member_projects own update"
  ON public.member_projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "member_projects own delete"
  ON public.member_projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Team WhatsApp groups
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Membership approval
ALTER TABLE public.member_records ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.member_records ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.member_records ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.member_records ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'form';