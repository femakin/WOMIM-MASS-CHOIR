import {  NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic database connection by trying to access known tables
    const tables = [];
    const errors = [];

    // Test admin_users table
    try {
      const {error: adminError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (adminError) {
        errors.push(`admin_users: ${adminError.message}`);
      } else {
        tables.push('admin_users');
      }
    } catch (e) {
      errors.push(`admin_users: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    // Test members table
    try {
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('count')
        .limit(1);
      
      if (membersError) {
        errors.push(`members: ${membersError.message}`);
      } else {
        tables.push('members');
      }
    } catch (e) {
      errors.push(`members: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    // Test events table
    try {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('count')
        .limit(1);
      
      if (eventsError) {
        errors.push(`events: ${eventsError.message}`);
      } else {
        tables.push('events');
      }
    } catch (e) {
      errors.push(`events: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    // If admin_users exists, try to get actual data
    let adminUsersData = null;
    if (tables.includes('admin_users')) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*');
        
        if (!error) {
          adminUsersData = data;
        }
      } catch (e) {
        // Ignore this error
      }
    }

    return NextResponse.json({
      message: 'Database connection test completed',
      available_tables: tables,
      errors: errors,
      admin_users_count: adminUsersData?.length || 0,
      admin_users: adminUsersData || [],
      suggestion: errors.length > 0 ? 'Some tables may not exist. Run database migrations if needed.' : 'All tables accessible'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
