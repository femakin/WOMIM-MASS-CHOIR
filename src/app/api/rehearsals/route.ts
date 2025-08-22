

// app/api/rehearsals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/supabase';

// // GET rehearsals from Supabase
// export async function GET(request: NextRequest) {
//   try {
//     // First check if the view exists, if not use the events table
//     const { data: viewExists, error: viewError } = await supabase
//       .from('rehearsal_details')
//       .select('*')
//       .limit(1);

//     if (viewError && viewError.code === 'PGRST205') {
//       // View doesn't exist, fall back to events table
//       const { data: events, error: eventsError } = await supabase
//         .from('events')
//         .select('*')
//         .eq('event_type', 'rehearsal')
//         .order('date', { ascending: false });

//       if (eventsError) throw eventsError;
      
//       // Transform events to match expected format
//       const rehearsals = events.map(event => ({
//         event_id: event.id,
//         title: event.title,
//         date: event.date,
//         start_time: event.start_time,
//         end_time: event.end_time,
//         location: event.location,
//         status: event.status,
//         rehearsal_number: 1,
//         rehearsal_type: 'regular',
//         focus_area: null,
//         songs_to_practice: [],
//         notes: '',
//         display_name: `Rehearsal ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`
//       }));

//       return NextResponse.json(rehearsals, { status: 200 });
//     }

//     if (viewError) throw viewError;
    
//     return NextResponse.json(viewExists, { status: 200 });
//       } catch (error: unknown) {
//       console.error('Get Rehearsals API error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
//       return NextResponse.json(
//         { error: errorMessage },
//         { status: 500 }
//       );
//     }
// }


// ✅ GET rehearsals from Supabase instead of mock data
export async function GET() {
  try {
    const rehearsals = await db.getRehearsals(); // calls your view rehearsal_details
    return NextResponse.json(rehearsals, { status: 200 });
  } catch (error: any) {
    console.error('Get Rehearsals API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, focusArea, songs } = body;

    // Validate required fields
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, start time, and end time are required' },
        { status: 400 }
      );
    }

    // First, create the event
    const eventData = {
      title: 'Weekly Rehearsal',
      event_type: 'rehearsal',
      description: focusArea ? `Focus: ${focusArea}` : 'Weekly choir rehearsal',
      date: date,
      start_time: startTime,
      end_time: endTime,
      location: 'Main Auditorium',
      status: 'upcoming',
      max_attendees: 100
    };

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (eventError) throw eventError;

    // Then, create the rehearsal record
    const rehearsalData = {
      event_id: event.id,
      rehearsal_number: 1, // You might want to calculate this dynamically
      rehearsal_type: 'regular',
      focus_area: focusArea || null,
      songs_to_practice: songs ? songs.split(/[,\n]/).map((s: string) => s.trim()).filter((s: string) => s) : [],
      notes: ''
    };

    const { data: rehearsal, error: rehearsalError } = await supabase
      .from('rehearsals')
      .insert([rehearsalData])
      .select()
      .single();

    if (rehearsalError) throw rehearsalError;

    // Return the created rehearsal with display info
    const newRehearsal = {
      event_id: event.id,
      title: event.title,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      status: event.status,
      rehearsal_number: rehearsal.rehearsal_number,
      rehearsal_type: rehearsal.rehearsal_type,
      focus_area: rehearsal.focus_area,
      songs_to_practice: rehearsal.songs_to_practice,
      notes: rehearsal.notes,
      display_name: `Rehearsal ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`
    };

    return NextResponse.json(
      { 
        message: 'Rehearsal added successfully!', 
        rehearsal: newRehearsal 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Add Rehearsal API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
