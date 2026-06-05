import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    // Generate guest ID: guest- followed by 2 random strings
    const randomPart1 = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    const guestId = `guest-${randomPart1}${randomPart2}`;

    // Create response and set cookie
    const response = NextResponse.next();
    
    // Set the cookie on response so it is saved in browser
    response.cookies.set("userId", guestId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Also set the cookie on request headers so Server Components rendering this request see it immediately
    request.cookies.set("userId", guestId);
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, logos, etc. (static public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
