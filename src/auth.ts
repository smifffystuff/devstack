import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED"
}
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  providers: [
    ...authConfig.providers.filter(
      (p) => (p as { id?: string }).id !== "credentials"
    ),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) return null

        if (
          process.env.ENABLE_EMAIL_VERIFICATION === "true" &&
          !user.emailVerified
        ) {
          throw new EmailNotVerifiedError()
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
})
