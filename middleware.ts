import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(pathname);
  if (pathname === '/' && request.cookies.has('access_token'))
    return NextResponse.redirect(new URL('/dashboard', request.url));

  if (pathname === '/dashboard' && !request.cookies.has('access_token'))
    return NextResponse.redirect(new URL('/', request.url));

  if (pathname === '/dashboard/product' && !request.cookies.has('access_token'))
    return NextResponse.redirect(new URL('/', request.url));

  if (pathname === '/dashboard/pos' && !request.cookies.has('access_token'))
    return NextResponse.redirect(new URL('/', request.url));

  if (
    pathname === '/dashboard/customermanager' &&
    !request.cookies.has('access_token')
  )
    return NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/dashboard/:path*']
};
