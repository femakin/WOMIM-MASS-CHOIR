import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

 /*    console.log('Auth attempt for username:', username); */

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    try {
      // Authenticate admin user
      console.log('Calling db.authenticateAdmin...');
      const admin = await db.authenticateAdmin(username, password);
      
     /*  console.log('Authentication result:', admin ? 'Success' : 'Failed'); */
      
      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Create session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

   /*    console.log('Creating admin session...'); */
      // Save session to database
     /*  const session = await db.createAdminSession(admin.id, sessionToken, expiresAt.toISOString()); */

      // console.log('Session created successfully');

      return NextResponse.json({
        message: 'Authentication successful',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          full_name: admin.full_name
        },
        session: {
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }
      });

    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const check = searchParams.get('check');

    // If check=db, return database status for debugging
    if (check === 'db') {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*');
        
        if (error) {
          return NextResponse.json({
            error: 'Database error',
            details: error.message,
            code: error.code
          }, { status: 500 });
        }

        return NextResponse.json({
          message: 'Database check successful',
          admin_users_count: data?.length || 0,
          admin_users: data || []
        });
      } catch (dbError) {
        return NextResponse.json({
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    // Validate session token
    const session = await db.validateAdminSession(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      session: session
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
