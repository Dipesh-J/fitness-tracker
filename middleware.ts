import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Create the Supabase middleware client
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if we're on a protected page
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isProfilePage = request.nextUrl.pathname.startsWith("/profile")
  
  // If user is not logged in and on protected page, redirect to login
  if (!session && isProfilePage) {
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and on auth page, redirect to dashboard
  if (session && isAuthPage && !request.nextUrl.pathname.includes("/callback")) {
    const redirectUrl = new URL("/", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify paths that the middleware should run on
export const config = {
  matcher: [
    // Exclude static files, api routes, etc
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
} 