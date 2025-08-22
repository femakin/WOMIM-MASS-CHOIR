import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, focusArea, songs } = body;

    console.log('Received data:', { date, startTime, endTime, focusArea, songs });

    // Test 1: Check if we can connect to events table
    const { data: eventsTest, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    console.log('Events table test:', { eventsTest, eventsError });

    if (eventsError) {
      return NextResponse.json(
        { error: `Events table error: ${eventsError.message}`, code: eventsError.code },
        { status: 500 }
      );
    }

    // Test 2: Try to insert a simple event
    const eventData = {
      title: 'Test Rehearsal',
      event_type: 'rehearsal',
      description: 'Test rehearsal for debugging',
      date: date,
      start_time: startTime,
      end_time: endTime,
      location: 'Test Location',
      status: 'upcoming',
      max_attendees: 50
    };

    console.log('Attempting to insert event:', eventData);

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (eventError) {
      return NextResponse.json(
        { error: `Event insertion error: ${eventError.message}`, code: eventError.code },
        { status: 500 }
      );
    }

    console.log('Event created successfully:', event);

    // Test 3: Try to insert rehearsal record
    const rehearsalData = {
      event_id: event.id,
      rehearsal_number: 1,
      rehearsal_type: 'regular',
      focus_area: focusArea || null,
      songs_to_practice: songs ? songs.split(/[,\n]/).map((s: string) => s.trim()).filter((s: string) => s) : [],
      notes: 'Test rehearsal'
    };

    console.log('Attempting to insert rehearsal:', rehearsalData);

    const { data: rehearsal, error: rehearsalError } = await supabase
      .from('rehearsals')
      .insert([rehearsalData])
      .select()
      .single();

    if (rehearsalError) {
      return NextResponse.json(
        { error: `Rehearsal insertion error: ${rehearsalError.message}`, code: rehearsalError.code },
        { status: 500 }
      );
    }

    console.log('Rehearsal created successfully:', rehearsal);

    return NextResponse.json(
      { 
        message: 'Debug rehearsal creation successful!', 
        event,
        rehearsal
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Debug rehearsal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
