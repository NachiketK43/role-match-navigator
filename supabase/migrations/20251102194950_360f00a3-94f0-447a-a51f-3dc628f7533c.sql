-- Add profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS years_of_experience integer,
ADD COLUMN IF NOT EXISTS career_goals text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS profile_picture_url text;