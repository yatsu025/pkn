import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: results, error } = await supabase
      .from('registrations')
      .select('*')
      .ilike('name', `%${query}%`)
      .or(`email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
