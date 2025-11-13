-- Create professional_contacts table
CREATE TABLE professional_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Basic Info
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  company TEXT,
  job_title TEXT,
  
  -- Categorization
  contact_type TEXT NOT NULL DEFAULT 'connection',
  relationship_strength TEXT DEFAULT 'cold',
  
  -- Context
  how_we_met TEXT,
  notes TEXT,
  tags TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_contacted_date TIMESTAMP WITH TIME ZONE,
  next_followup_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full text search
  search_vector tsvector
);

-- Create contact_interactions table
CREATE TABLE contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES professional_contacts(id) ON DELETE CASCADE,
  
  -- Interaction Details
  interaction_type TEXT NOT NULL,
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Content
  title TEXT NOT NULL,
  notes TEXT,
  
  -- Follow-up
  requires_followup BOOLEAN DEFAULT false,
  followup_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_applications_link junction table
CREATE TABLE contact_applications_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES professional_contacts(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  
  -- Relationship Context
  link_type TEXT DEFAULT 'referral',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(contact_id, application_id)
);

-- Indexes for professional_contacts
CREATE INDEX idx_contacts_user_id ON professional_contacts(user_id);
CREATE INDEX idx_contacts_search ON professional_contacts USING GIN(search_vector);
CREATE INDEX idx_contacts_next_followup ON professional_contacts(next_followup_date) WHERE next_followup_date IS NOT NULL;

-- Indexes for contact_interactions
CREATE INDEX idx_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX idx_interactions_user_id ON contact_interactions(user_id);
CREATE INDEX idx_interactions_followup ON contact_interactions(followup_date) WHERE followup_date IS NOT NULL;

-- Indexes for contact_applications_link
CREATE INDEX idx_contact_apps_contact_id ON contact_applications_link(contact_id);
CREATE INDEX idx_contact_apps_application_id ON contact_applications_link(application_id);

-- Full-text search trigger for contacts
CREATE TRIGGER update_contacts_search_vector
  BEFORE INSERT OR UPDATE ON professional_contacts
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(
    search_vector, 'pg_catalog.english',
    full_name, company, job_title, notes
  );

-- Updated_at trigger for contacts
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON professional_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for professional_contacts
ALTER TABLE professional_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON professional_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON professional_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON professional_contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON professional_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for contact_interactions
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON contact_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON contact_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON contact_interactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON contact_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for contact_applications_link
ALTER TABLE contact_applications_link ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links"
  ON contact_applications_link FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links"
  ON contact_applications_link FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON contact_applications_link FOR DELETE
  USING (auth.uid() = user_id);