import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    // Check caller is admin using their JWT
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .single()

    if (callerProfile?.role !== 'admin') {
      return new Response('Forbidden', { status: 403 })
    }

    const { email, password, username, full_name, role } = await req.json()

    // Use service role to create auth user — no email sent, no rate limit
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError

    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      username,
      full_name,
      role,
    })

    if (profileError) {
      // Rollback auth user if profile insert fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return new Response(JSON.stringify({ id: authData.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
