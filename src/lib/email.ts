import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "onboarding@resend.dev"

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your DevStash password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f5f5f5; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #a3a3a3; line-height: 1.6;">
          We received a request to reset your DevStash password. Click the button below to choose a new password.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;"
        >
          Reset Password
        </a>
        <p style="color: #737373; font-size: 14px; margin-top: 24px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #737373; font-size: 12px; margin-top: 16px;">
          This link expires in 1 hour.
        </p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f5f5f5; margin-bottom: 16px;">Welcome to DevStash</h2>
        <p style="color: #a3a3a3; line-height: 1.6;">
          Click the button below to verify your email address and activate your account.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;"
        >
          Verify Email
        </a>
        <p style="color: #737373; font-size: 14px; margin-top: 24px;">
          If you didn't create a DevStash account, you can safely ignore this email.
        </p>
        <p style="color: #737373; font-size: 12px; margin-top: 16px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  })
}
