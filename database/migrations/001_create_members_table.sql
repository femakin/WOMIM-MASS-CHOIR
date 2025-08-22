-- Create members table for WOMIM choir registration
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information (Part A)
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  contact_address TEXT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile_number VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  marital_status VARCHAR(20) NOT NULL CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  whatsapp_number VARCHAR(20) NOT NULL,
  social_media_id VARCHAR(255) NOT NULL,
  
  -- Spiritual Information (Part B)
  is_born_again BOOLEAN NOT NULL,
  holy_ghost_baptism BOOLEAN NOT NULL,
  local_church_name VARCHAR(255) NOT NULL,
  local_church_address TEXT NOT NULL,
  academic_qualification VARCHAR(255) NOT NULL,
  job_status VARCHAR(20) NOT NULL CHECK (job_status IN ('Employed', 'Unemployed', 'Self-employed')),
  profession VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  
  -- System fields
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_created_at ON members(created_at);

-- Create events table for choir events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table for tracking member attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique attendance per member per event
  UNIQUE(member_id, event_id)
);

-- Create indexes for attendance
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_attendance_date ON attendance(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON members 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO events (title, description, date, location, status) VALUES
('Weekly Rehearsal', 'Regular choir practice session', NOW() + INTERVAL '1 day', 'Main Auditorium', 'upcoming'),
('Sunday Service', 'Sunday morning worship service', NOW() + INTERVAL '3 days', 'Main Auditorium', 'upcoming'),
('Special Performance', 'Special choir performance for church anniversary', NOW() + INTERVAL '7 days', 'Main Auditorium', 'upcoming');
