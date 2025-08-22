-- Create events and rehearsals tables for WOMIM choir management
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('rehearsal', 'performance', 'meeting', 'other')),
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rehearsals table specifically for choir practices
CREATE TABLE IF NOT EXISTS rehearsals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rehearsal_number INTEGER NOT NULL,
  rehearsal_type VARCHAR(50) DEFAULT 'regular' CHECK (rehearsal_type IN ('regular', 'special', 'dress_rehearsal')),
  focus_area TEXT,
  songs_to_practice TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  recorded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique attendance per member per event
  UNIQUE(event_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_rehearsals_event_id ON rehearsals(event_id);
CREATE INDEX idx_attendance_records_event_id ON attendance_records(event_id);
CREATE INDEX idx_attendance_records_member_id ON attendance_records(member_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);

-- Create function to update updated_at timestamp for events
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_events_updated_at();

-- Insert sample events and rehearsals
INSERT INTO events (title, event_type, description, date, start_time, end_time, location, status, max_attendees) VALUES
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-01-27', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-03', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-10', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-17', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-24', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Sunday Service Performance', 'performance', 'Sunday morning worship service performance', '2025-02-23', '09:00:00', '12:00:00', 'Main Auditorium', 'upcoming', 150),
('Choir Anniversary', 'performance', 'Special choir anniversary celebration', '2025-03-15', '16:00:00', '19:00:00', 'Main Auditorium', 'upcoming', 200);

-- Insert rehearsals with numbers
INSERT INTO rehearsals (event_id, rehearsal_number, rehearsal_type, focus_area, songs_to_practice) VALUES
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-01-27'), 1, 'regular', 'Warm-up and basic songs', ARRAY['Amazing Grace', 'How Great Thou Art']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-03'), 2, 'regular', 'New song introduction', ARRAY['Great Is Thy Faithfulness', 'It Is Well']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-10'), 3, 'regular', 'Harmony practice', ARRAY['Be Thou My Vision', 'Come Thou Fount']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-17'), 4, 'regular', 'Performance preparation', ARRAY['Holy, Holy, Holy', 'All Hail the Power']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-24'), 5, 'regular', 'Final rehearsal before performance', ARRAY['All songs for Sunday service']);

-- Create view for easy access to rehearsal information
CREATE OR REPLACE VIEW rehearsal_details AS
SELECT 
  e.id as event_id,
  e.title,
  e.date,
  e.start_time,
  e.end_time,
  e.location,
  e.status,
  r.rehearsal_number,
  r.rehearsal_type,
  r.focus_area,
  r.songs_to_practice,
  r.notes,
  CONCAT('Rehearsal #', r.rehearsal_number, ' ', TO_CHAR(e.date, 'Mon DD, YYYY')) as display_name
FROM events e
JOIN rehearsals r ON e.id = r.event_id
WHERE e.event_type = 'rehearsal'
ORDER BY e.date DESC, r.rehearsal_number DESC;
