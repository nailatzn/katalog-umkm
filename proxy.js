import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "") : "";

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const pathTanpaSlash = pathname.replace(/\/+$/, "");

  // Proteksi semua rute /admin kecuali /admin/login
  if (pathTanpaSlash.startsWith("/admin") && pathTanpaSlash !== "/admin/login") {
    if (!user) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Jika sudah login dan membuka /admin/login, alihkan ke /admin
  if (pathTanpaSlash === "/admin/login" && user) {
    const url = new URL("/admin", request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};

