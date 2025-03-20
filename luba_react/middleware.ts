// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip redirect in development
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  // Check if the request is not HTTPS.
  // The 'x-forwarded-proto' header is typically set by a reverse proxy (like Vercel or Netlify)
  if (request.headers.get("x-forwarded-proto") !== "https") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply this middleware to all routes
export const config = {
  matcher: "/:path*",
};
