import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get Supabase session (reads cookies set by Supabase)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  // Use getUser in middleware to refresh tokens and validate session on the auth server
  const { data: { user } } = await supabase.auth.getUser();

  const url = req.nextUrl;
  const path = url.pathname;

  if (!user) {
    // If not logged in, no redirect; allow public routes as-is
    return res;
  }

  // Determine default route from a lightweight cookie set client-side when role is known
  const roleCookie = req.cookies.get('rm_role')?.value;
  const isPro = roleCookie === 'professional';
  const defaultPath = isPro ? '/dashboard' : '/myreviews';

  // Redirect logged-in users from / or /login to their default pretty route
  if (path === '/' || path === '/login') {
    const target = url.clone();
    target.pathname = defaultPath;
    return NextResponse.redirect(target);
  }

  // Optional guard: prevent customers from hitting /dashboard directly
  if (path === '/dashboard' && !isPro) {
    const target = url.clone();
    target.pathname = '/myreviews';
    return NextResponse.redirect(target);
  }

  return res;
}

export const config = {
  matcher: ['/', '/login', '/dashboard'],
};
