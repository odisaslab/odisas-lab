import { NextResponse, type NextRequest } from 'next/server';

/**
 * Comprobación optimista: sin cookie de sesión, las páginas redirigen a /login.
 * La sesión y los permisos se validan de verdad en cada ruta de la API.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has('radar_session')) return NextResponse.next();
  const url = new URL('/login', request.url);
  if (request.nextUrl.pathname !== '/') url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|login|_next/static|_next/image|brand|favicon.ico).*)'],
};
