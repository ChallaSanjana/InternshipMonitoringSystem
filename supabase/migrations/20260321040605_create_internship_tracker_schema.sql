/*
  # Internship Tracker Database Schema

  ## Overview
  Complete database schema for internship tracking system with authentication, roles, and file management.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `full_name` (text, not null)
  - `role` (text, not null, default 'student') - Can be 'admin' or 'student'
  - `phone` (text)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `internships`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `company_name` (text, not null)
  - `position` (text, not null)
  - `description` (text)
  - `start_date` (date, not null)
  - `end_date` (date, not null)
  - `status` (text, not null, default 'active') - Can be 'active', 'completed', 'pending'
  - `location` (text)
  - `stipend` (numeric)
  - `supervisor_name` (text)
  - `supervisor_email` (text)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `reports`
  - `id` (uuid, primary key)
  - `internship_id` (uuid, references internships)
  - `user_id` (uuid, references profiles)
  - `title` (text, not null)
  - `description` (text)
  - `file_path` (text) - Path to file in Supabase storage
  - `file_name` (text)
  - `file_size` (integer)
  - `submitted_at` (timestamptz, default now())
  - `created_at` (timestamptz, default now())

  ## 2. Security
  - Enable RLS on all tables
  - Profiles: Users can read their own profile, admins can read all
  - Internships: Users can manage their own, admins can manage all
  - Reports: Users can manage their own, admins can view all

  ## 3. Important Notes
  - Role-based access control implemented via RLS policies
  - File uploads will use Supabase Storage
  - All timestamps use timestamptz for consistency
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create internships table
CREATE TABLE IF NOT EXISTS internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending')),
  location text,
  stipend numeric,
  supervisor_name text,
  supervisor_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_path text,
  file_name text,
  file_size integer,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Internships policies
CREATE POLICY "Users can view own internships"
  ON internships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all internships"
  ON internships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own internships"
  ON internships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own internships"
  ON internships FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own internships"
  ON internships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all internships"
  ON internships FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internships_user_id ON internships(user_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_reports_internship_id ON reports(internship_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at
  BEFORE UPDATE ON internships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();