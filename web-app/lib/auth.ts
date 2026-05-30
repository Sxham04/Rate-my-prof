import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

const ALLOWED_DOMAIN = "dituniversity.edu.in"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "onboarding@resend.dev",
      name: "DIT University",
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // const email = user.email ?? ""
      // if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) return false
      return true
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      return baseUrl
    },
  },

  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/auth-error",
  },
})