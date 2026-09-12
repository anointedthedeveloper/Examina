import { supabase } from './supabase'

export const toAuthEmail = (username) => {
  const u = username.toLowerCase()
  const padded = u.length < 3 ? u.padEnd(3, '_') : u
  return `${padded}@examina.internal`
}

// Checks if username exists, appends numeric suffix until unique
export const generateUniqueUsername = async (base) => {
  const clean = base.toLowerCase().replace(/\s+/g, '')
  let candidate = clean
  let counter = 1
  while (true) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle()
    if (!data) return candidate
    candidate = `${clean}${counter}`
    counter++
  }
}
