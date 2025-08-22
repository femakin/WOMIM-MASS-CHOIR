import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Create a service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // This should be in your .env.local
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({
        error: 'Failed to check existing admin',
        details: checkError.message
      }, { status: 500 });
    }

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        admin: {
          username: existingAdmin.username,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Create default admin user using service role
    const { data: newAdmin, error: createError } = await supabaseAdmin
      .from('admin_users')
      .insert([{
        username: 'admin',
        email: 'admin@womim.org',
        password_hash: 'womim2025', // In production, use proper hashing
        full_name: 'WOMIM Administrator',
        role: 'super_admin',
        is_active: true
      }])
      .select()
      .single();

    if (createError) {
      return NextResponse.json({
        error: 'Failed to create admin user',
        details: createError.message,
        suggestion: 'Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      },
      credentials: {
        username: 'admin',
        password: 'womim2025'
      }
    });

  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check your environment variables and database connection'
    }, { status: 500 });
  }
}
