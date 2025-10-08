import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Map subdomains to tab values used in the app UI
const SUBDOMAIN_TAB_MAP: Record<string, 'myreviews' | 'aisearch' | 'reviews' | 'directory' | 'dashboard'> = {
  my: 'myreviews',
  ai: 'aisearch',
  write: 'reviews',
  browse: 'directory',
  pro: 'dashboard',
};

export function middleware(req: NextRequest) {
  const { pathname, searchParams, origin } = new URL(req.url);
  const host = req.headers.get('host') || '';

  // Skip Next internals and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // Extract subdomain: e.g., ai.example.com -> ai
  const hostParts = host.split(':')[0].split('.'); // strip port
  const sub = hostParts.length > 2 ? hostParts[0] : '';

  const tab = SUBDOMAIN_TAB_MAP[sub];
  if (!tab) {
    return NextResponse.next();
  }

  // Only rewrite the root path to avoid breaking other routes
  if (pathname === '/') {
    const url = new URL(origin);
    url.pathname = '/';
    // Preserve existing queries and set tab
    searchParams.forEach((v, k) => url.searchParams.set(k, v));
    url.searchParams.set('tab', tab);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Run on all paths so we can catch root; static and api are skipped above
export const config = {
  matcher: ['/((?!.*).*)'],
};
