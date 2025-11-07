-- Create custom types for application tracking
CREATE TYPE application_status AS ENUM (
  'wishlist',
  'applied',
  'screening',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'withdrawn'
);

CREATE TYPE application_priority AS ENUM ('low', 'medium', 'high');

CREATE TYPE activity_type AS ENUM (
  'note',
  'status_change',
  'interview_scheduled',
  'follow_up_sent',
  'response_received',
  'document_submitted',
  'offer_received',
  'custom'
);

-- Create function for updating timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create job_applications table
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job Details
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  location TEXT,
  salary_range TEXT,
  job_description TEXT,
  
  -- Application Tracking
  status application_status NOT NULL DEFAULT 'wishlist',
  priority application_priority DEFAULT 'medium',
  applied_date DATE,
  deadline DATE,
  
  -- Contact Information
  recruiter_name TEXT,
  recruiter_email TEXT,
  recruiter_linkedin TEXT,
  
  -- Notes and Documents
  notes TEXT,
  cover_letter_used TEXT,
  resume_version TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(job_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C')
  ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(user_id, status);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX idx_job_applications_search ON job_applications USING GIN(search_vector);

-- Create application_activities table
CREATE TABLE application_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  activity_type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- For scheduled items (interviews, follow-ups)
  scheduled_for TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_activities_app_id ON application_activities(application_id);
CREATE INDEX idx_application_activities_user_id ON application_activities(user_id);
CREATE INDEX idx_application_activities_scheduled ON application_activities(user_id, scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on application_activities
ALTER TABLE application_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON application_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON application_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON application_activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON application_activities FOR DELETE
  USING (auth.uid() = user_id);