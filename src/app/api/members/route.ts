import {  NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
  try {
    const members = await db.getMembers();
    return NextResponse.json(members || []);
  } catch (error) {
    console.error('Get members error:', error);
    
    // If table doesn't exist or other database error, return empty array
    if (error instanceof Error && (error.message.includes('relation') || 
        error.message.includes('does not exist'))) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
