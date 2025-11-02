-- Change years_of_experience column from integer to text to support range values
ALTER TABLE public.profiles 
ALTER COLUMN years_of_experience TYPE text USING years_of_experience::text;