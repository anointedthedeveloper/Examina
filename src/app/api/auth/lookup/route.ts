import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Looks up a username in profiles and returns the associated email
// so the client can sign in with email+password via Supabase Auth
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try matching by username field first, then fall back to email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .or(`username.eq.${username.trim()},email.eq.${username.trim()}`)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ email: profile.email })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
