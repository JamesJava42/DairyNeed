import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in env.");
}
if (!anonKey) {
  throw new Error("Missing SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.");
}

export const supabase = createClient(supabaseUrl, anonKey);
