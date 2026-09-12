import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Uses service role key so RLS doesn't block unauthenticated lookup
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const identifier = (body.username ?? '').trim()

    if (!identifier) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Look up by email directly (works before username column is added)
    // OR by username column if it exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', identifier)
      .maybeSingle()

    if (!error && profile) {
      return NextResponse.json({ email: profile.email })
    }

    // Try username column (after 08_add_username_column.sql is run)
    const { data: byUsername } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .maybeSingle()

    if (byUsername?.email) {
      return NextResponse.json({ email: byUsername.email })
    }

    return NextResponse.json(
      { error: 'No account found with that username. Contact your school admin.' },
      { status: 404 }
    )
  } catch (err) {
    console.error('Lookup error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
