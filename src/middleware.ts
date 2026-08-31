import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthRoute = nextUrl.pathname.startsWith('/login');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    
    // In a real production app, we should also check req.auth.user.role === 'ADMIN'
    // but the session type needs to be checked carefully. 
    // If auth returns the session object properly, we can check role:
    if (req.auth?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
