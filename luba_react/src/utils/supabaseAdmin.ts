// src/utils/supabaseAdmin.ts (server-side only)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase Admin URL:", supabaseUrl);
console.log("Supabase Service Role Key (first 10 chars):", supabaseServiceKey?.substring(0, 10));

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase URL or Service Role Key in environment variables");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

supabaseAdmin.rpc("get_current_role").then(({ data, error }) => {
  console.log("Initial role check for supabaseAdmin:", { data, error });
});