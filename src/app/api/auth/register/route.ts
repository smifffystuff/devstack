import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, getIP, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getIP(request)
    const rateLimit = await checkRateLimit("register", ip)
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset)
    }

    const { name, email, password, confirmPassword } = await request.json()

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      )
    }

    const emailVerificationEnabled =
      process.env.ENABLE_EMAIL_VERIFICATION === "true"

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      // Return the same response as success to prevent email enumeration
      return NextResponse.json(
        {
          success: true,
          redirect: emailVerificationEnabled ? "/verify-email" : "/sign-in",
        },
        { status: 201 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(!emailVerificationEnabled && { emailVerified: new Date() }),
      },
    })

    if (emailVerificationEnabled) {
      const verificationToken = await generateVerificationToken(email)
      await sendVerificationEmail(email, verificationToken.token)
    }

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
        redirect: emailVerificationEnabled ? "/verify-email" : "/sign-in",
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
