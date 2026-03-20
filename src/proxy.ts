import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard")

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
