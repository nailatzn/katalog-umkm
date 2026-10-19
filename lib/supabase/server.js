import { createClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase di sisi server menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY.
 * Kunci rahasia melewati RLS dan hanya boleh dipakai di lingkungan server (Server Component/Server Action).
 */
export function buatClientServer() {
  const rawUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !secretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum disetel di environment variable."
    );
  }

  // Bersihkan URL jika ada trailing slash atau path /rest/v1
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = buatClientServer;
export default buatClientServer;

