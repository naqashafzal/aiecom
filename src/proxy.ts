import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  // If trying to access admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
    
    // Check if user is ADMIN
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/account", req.nextUrl))
    }
  }

  // If logged in and trying to access login page
  if (isAuthRoute && isLoggedIn) {
    if (req.auth?.user?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl))
    } else {
      return NextResponse.redirect(new URL("/account", req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
