import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat client Supabase di sisi server menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY.
 * Kunci rahasia melewati RLS dan hanya dipakai untuk membaca data publik (Server Component/Server Action).
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

/**
 * Membuat client Supabase sesi admin menggunakan SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, dan cookie.
 * Dipakai untuk login, logout, ganti password, dan aksi admin lainnya.
 */
export async function buatClientSesi() {
  const cookieStore = await cookies();

  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum disetel di environment variable."
    );
  }

  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Method setAll dipanggil dari Server Component (bisa diabaikan jika ada proxy/middleware)
        }
      },
    },
  });
}

export const createAdminSessionClient = buatClientSesi;
export default buatClientServer;
