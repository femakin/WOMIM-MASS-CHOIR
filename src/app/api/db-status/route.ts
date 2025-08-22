import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const testResults = {
    connection: false,
    tables: {
      members: false,
      events: false,
      rehearsals: false,
      attendance_records: false,
      admin_users: false,
      admin_sessions: false
    },
    environment: {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      node_env: process.env.NODE_ENV
    },
    errors: [] as string[]
  };

  try {
    // Test connection with a simple query
    const { error: connectionError } = await supabase
      .from('members')
      .select('id')
      .limit(1);

    if (connectionError) {
      testResults.errors.push(`Connection error: ${connectionError.message}`);
    } else {
      testResults.connection = true;
    }

    // Test each table individually
    const tablesToTest = ['members', 'events', 'rehearsals', 'attendance_records', 'admin_users', 'admin_sessions'];
    
    for (const table of tablesToTest) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          testResults.errors.push(`Table '${table}': ${error.message}`);
          testResults.tables[table as keyof typeof testResults.tables] = false;
        } else {
          testResults.tables[table as keyof typeof testResults.tables] = true;
        }
      } catch (tableError) {
        testResults.errors.push(`Table '${table}': ${tableError instanceof Error ? tableError.message : 'Unknown error'}`);
        testResults.tables[table as keyof typeof testResults.tables] = false;
      }
    }

    const allTablesWorking = Object.values(testResults.tables).every(status => status === true);
    const status = testResults.connection && allTablesWorking ? 'success' : 'partial';

    return NextResponse.json(
      {
        status,
        message: status === 'success' 
          ? 'All database connections and tables are working!' 
          : 'Some database issues detected',
        results: testResults,
        timestamp: new Date().toISOString()
      },
      { status: status === 'success' ? 200 : 207 }
    );

  } catch (error) {
    testResults.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database status check failed',
        results: testResults,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
