import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attendanceData, adminUserId } = body;

    // Validate required fields
    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return NextResponse.json(
        { error: 'Attendance data array is required' },
        { status: 400 }
      );
    }

    // Validate each attendance record
    for (const record of attendanceData) {
      if (!record.member_id) {
        return NextResponse.json(
          { error: 'Member ID is required for each attendance record' },
          { status: 400 }
        );
      }
      if (!record.event_id) {
        return NextResponse.json(
          { error: 'Event/Rehearsal ID is required for each attendance record. Please select a rehearsal first.' },
          { status: 400 }
        );
      }
      if (!record.status) {
        return NextResponse.json(
          { error: 'Status is required for each attendance record' },
          { status: 400 }
        );
      }
    }

    // Transform data to match database schema
    const transformedData = attendanceData.map(record => ({
      event_id: record.event_id,
      member_id: record.member_id,
      status: record.status,
      notes: record.notes || ''
    }));

    // Save to database using the db function - adminUserId is optional for now
    const savedAttendance = await db.saveAttendance(transformedData, adminUserId || null);

    return NextResponse.json(
      { 
        message: 'Attendance saved successfully!',
        attendance: savedAttendance
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const memberId = searchParams.get('memberId');

    if (!eventId && !memberId) {
      return NextResponse.json(
        { error: 'Either eventId or memberId is required' },
        { status: 400 }
      );
    }

    if (eventId) {
      // Get attendance for a specific event
      try {
        const data = await db.getAttendanceForEvent(eventId);
        return NextResponse.json(data || []);
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // If table doesn't exist or other database error, return empty array
        if (dbError instanceof Error && (dbError.message.includes('relation') || 
            dbError.message.includes('does not exist'))) {
          return NextResponse.json([]);
        }
        
        throw dbError;
      }
    } else if (memberId) {
      // Get attendance for a specific member
      try {
        const data = await db.getAttendance(memberId);
        return NextResponse.json(data || []);
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // If table doesn't exist or other database error, return empty array
        if (dbError instanceof Error && (dbError.message.includes('relation') || 
            dbError.message.includes('does not exist'))) {
          return NextResponse.json([]);
        }
        
        throw dbError;
      }
    }

    // This should never be reached due to the validation above, but TypeScript needs it
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
