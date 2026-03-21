import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/email"
import { checkRateLimit, getIP, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = getIP(request)
  const rateLimit = await checkRateLimit("forgotPassword", ip)
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset)
  }

  const { email } = await request.json()

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return NextResponse.json({ success: true })
  }

  const token = await generatePasswordResetToken(email.toLowerCase())
  await sendPasswordResetEmail(email.toLowerCase(), token.token)

  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest) {
  const ip = getIP(request)
  const rateLimit = await checkRateLimit("resetPassword", ip)
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset)
  }

  const { token, password } = await request.json()

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 400 }
    )
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    )
  }

  const resetToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!resetToken) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    )
  }

  if (resetToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token },
    })
    return NextResponse.json(
      { error: "Reset link has expired. Please request a new one." },
      { status: 400 }
    )
  }

  const hashedPassword = await hash(password, 12)

  await prisma.user.update({
    where: { email: resetToken.identifier },
    data: { password: hashedPassword },
  })

  await prisma.verificationToken.delete({
    where: { token },
  })

  return NextResponse.json({ success: true })
}
