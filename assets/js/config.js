/* emopet — runtime config
 *
 * The Supabase anon (public) key is designed to be shipped in client code.
 * Security comes from Row Level Security, not from hiding this key.
 * Run the RLS policy in README.md so anon can ONLY insert into the waitlist.
 *
 * TODO: replace the two placeholders below with your real project values.
 */
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

/* Waitlist table + columns the client writes to. */
export const WAITLIST_TABLE = "waitlist";

/* Set to true once real credentials are in place. Until then the form
 * validates and shows success UI locally without hitting the network. */
export const SUPABASE_READY = false;
