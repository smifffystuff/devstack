import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getIP, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getIP(request)
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const key = `${ip}:${email}`
    const rateLimit = await checkRateLimit("login", key)
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset)
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (
      process.env.ENABLE_EMAIL_VERIFICATION === "true" &&
      !user.emailVerified
    ) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
