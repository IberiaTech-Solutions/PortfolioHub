import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/applications", "/collaborations", "/create-portfolio", "/recruiter"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const pathname = req.nextUrl.pathname;

    // Check if Supabase environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res;
    }

    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession();

    // Protect authenticated routes
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

    if ((isProtected || isAdmin) && !session) {
      const redirectUrl = new URL("/auth", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Admin routes: verify admin role from session metadata
    if (isAdmin && session) {
      const appMetadata = session.user?.app_metadata;
      if (appMetadata?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/.*|api/.*|.*\\.png$).*)",
  ],
};
