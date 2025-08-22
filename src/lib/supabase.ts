import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types - Updated to match the new registration form
export interface Member {
  id: string;
  // Personal Information (Part A)
  surname: string;
  first_name: string;
  contact_address: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  whatsapp_number: string;
  social_media_id: string;
  
  // Spiritual Information (Part B)
  is_born_again: boolean;
  holy_ghost_baptism: boolean;
  local_church_name: string;
  local_church_address: string;
  academic_qualification: string;
  job_status: 'Employed' | 'Unemployed' | 'Self-employed';
  profession: string;
  photo_url?: string;
  
  // System fields
  status: 'pending' | 'approved' | 'rejected';
  role: 'Chorister' | 'Instrumentalist' | 'Usher' | 'Conductor' | 'Other';
  registration_number?: string; // Optional since it's auto-generated
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  admin_user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  event_type: 'rehearsal' | 'performance' | 'meeting' | 'other';
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  max_attendees?: number;
  created_at: string;
  updated_at: string;
}

export interface Rehearsal {
  id: string;
  event_id: string;
  rehearsal_number: number;
  rehearsal_type: 'regular' | 'special' | 'dress_rehearsal';
  focus_area?: string;
  songs_to_practice?: string[];
  notes?: string;
  created_at: string;
}

export interface RehearsalDetail {
  event_id: string;
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status: string;
  rehearsal_number: number;
  rehearsal_type: string;
  focus_area?: string;
  songs_to_practice?: string[];
  notes?: string;
  display_name?: string;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  event_id: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  created_at: string;
}

// Database operations
export const db = {
  // Member operations
  async createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at' | 'registration_number'> & { registration_number?: string }) {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getMember(id: string) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Event operations
  async createEvent(event: Omit<Event, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Attendance operations
  async recordAttendance(attendance: Omit<Attendance, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendance])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAttendance(eventId?: string, memberId?: string) {
    let query = supabase.from('attendance').select('*');
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    if (memberId) {
      query = query.eq('member_id', memberId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Admin operations
  async authenticateAdmin(username: string, password: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Database error in authenticateAdmin:', error);
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      // For now, check plain text password (in production, use proper hashing)
      if (data.password_hash === password) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error in authenticateAdmin:', error);
      throw error;
    }
  },

  // Rehearsal operations
  async getRehearsals() {
    // Try to get from rehearsal_details view first, fallback to events table
    try {
      const { data, error } = await supabase
        .from('rehearsal_details')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (viewError) {
      // Fallback to events table
      console.log(viewError)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_type', 'rehearsal')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transform to match expected format
      return data.map(event => ({
        event_id: event.id,
        title: event.title,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        status: event.status,
        rehearsal_number: 1,
        rehearsal_type: 'regular',
        focus_area: null,
        songs_to_practice: [],
        notes: '',
        display_name: `Rehearsal ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`
      }));
    }
  },

  async postRehearsals(rehearsalData: Omit<RehearsalDetail, 'id' | 'created_at' | 'updated_at'>) {
    // This function is now handled directly in the API route
    // Keeping for backward compatibility but it's not used
    throw new Error('Use the API route directly for creating rehearsals');
  },

  async getRehearsalById(id: string) {
    const { data, error } = await supabase
      .from('rehearsal_details')
      .select('*')
      .eq('event_id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Attendance operations
  async getAttendanceForEvent(eventId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        members (
          id,
          surname,
          first_name,
          registration_number,
          role
        )
      `)
      .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
  },

  async saveAttendance(attendanceData: Array<{
    event_id: string;
    member_id: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>, adminUserId?: string | null) {
    const attendanceRecords = attendanceData.map(record => ({
      ...record,
      recorded_by: adminUserId || null,
      check_in_time: record.status === 'present' || record.status === 'late' ? new Date().toISOString() : null
    }));

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(attendanceRecords, { 
        onConflict: 'event_id,member_id',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  async createAdminSession(adminUserId: string, sessionToken: string, expiresAt: string) {
    const { data, error } = await supabase
      .from('admin_sessions')
      .insert([{
        admin_user_id: adminUserId,
        session_token: sessionToken,
        expires_at: expiresAt
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async validateAdminSession(sessionToken: string) {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAdminSession(sessionToken: string) {
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', sessionToken);
    
    if (error) throw error;
  },
};
