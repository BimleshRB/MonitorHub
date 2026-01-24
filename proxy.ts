import { NextRequest, NextResponse } from 'next/server'

// Proxy entrypoint (replaces legacy middleware). Runs for every matched request.
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect from /dashboard and /admin root to their actual pages
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/monitors', request.url))
  }

  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
