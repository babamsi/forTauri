import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(pathname);
  if (pathname === '/' && request.cookies.has('access_token'))
    return NextResponse.redirect(new URL('/dashboard', request.url));

  if (
    pathname === '/dashboard' ||
    pathname === '/dashboard/pos' ||
    (pathname === '/dashboard/product' && !request.cookies.has('access_token'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/dashboard/:path*']
};
