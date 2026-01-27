// =============================================================================
// NEXT.JS MIDDLEWARE FOR ROUTE PROTECTION
// =============================================================================
// Simplified middleware that only handles basic route protection
// Main authentication checking is done client-side via AuthContext
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/register'];

// Token storage key (must match what's used in the client)
const TOKEN_KEY = 'access_token';

// -----------------------------------------------------------------------------
// Middleware Function
// -----------------------------------------------------------------------------

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies
    const token = request.cookies.get(TOKEN_KEY)?.value;

    // If user has a token and is on login/register, redirect to dashboard
    if (token && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Handle root path
    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Allow all other requests - client-side auth will handle protection
    return NextResponse.next();
}

// -----------------------------------------------------------------------------
// Matcher Configuration
// -----------------------------------------------------------------------------
// Only match specific routes we want to handle

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
    ],
};
