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
    // Check if user is ADMIN or VENDOR
    // For now, we just check if they are logged in.
    // To strictly enforce admin: if (req.auth.user.role !== "ADMIN") return redirect("/")
  }

  // If logged in and trying to access login page
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
