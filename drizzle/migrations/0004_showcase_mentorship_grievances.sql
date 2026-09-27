ALTER TABLE public.member_projects ADD COLUMN IF NOT EXISTS case_study text;

CREATE OR REPLACE FUNCTION public.public_showcase(_limit int DEFAULT 6)
RETURNS TABLE(id uuid, title text, description text, case_study text, role text, tech_stack text[], project_url text, repo_url text, image_url text, member_name text, portfolio_url text, linkedin_url text, github_url text, behance_url text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.title, p.description, p.case_study, p.role, p.tech_stack, p.project_url, p.repo_url, p.image_url,
         pr.full_name, pr.portfolio_url, pr.linkedin_url, pr.github_url, pr.behance_url, p.created_at
  FROM public.member_projects p JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.is_public ORDER BY p.created_at DESC LIMIT _limit
$$;
GRANT EXECUTE ON FUNCTION public.public_showcase(int) TO anon, authenticated;

CREATE TABLE public.mentorship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'mentee',
  areas text[] NOT NULL DEFAULT '{}',
  experience text,
  goals text,
  availability text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.mentorship_applications TO authenticated;
GRANT ALL ON public.mentorship_applications TO service_role;
ALTER TABLE public.mentorship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentorship own or staff read" ON public.mentorship_applications FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "mentorship own insert" ON public.mentorship_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "mentorship staff update" ON public.mentorship_applications FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  message text NOT NULL,
  anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.grievances TO authenticated;
GRANT ALL ON public.grievances TO service_role;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grievances own or staff read" ON public.grievances FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "grievances own insert" ON public.grievances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'open');
CREATE POLICY "grievances staff update" ON public.grievances FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));