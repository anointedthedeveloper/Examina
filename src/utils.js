// Converts username to a valid Supabase auth email
// Pads short usernames to meet the 3-char minimum local part requirement
export const toAuthEmail = (username) => {
  const u = username.toLowerCase()
  const padded = u.length < 3 ? u.padEnd(3, '_') : u
  return `${padded}@examina.internal`
}
