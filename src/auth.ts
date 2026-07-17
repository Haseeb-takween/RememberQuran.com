import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { authConfig } from "@/auth.config"
import { validateCredentials } from "@/lib/auth/credentials"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/User"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = validateCredentials(
          credentials.email,
          credentials.password,
        )
        if (!parsed.success) return null

        await connectToDatabase()

        const user = await User.findOne({ email: parsed.data.email })
          .select("+passwordHash")
          .lean()

        if (!user || user.moderation?.suspended) return null

        const passwordMatches = await compare(
          parsed.data.password,
          user.passwordHash,
        )
        if (!passwordMatches) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.profile?.displayName || null,
          roles: Array.isArray(user.roles) ? user.roles : ["user"],
        }
      },
    }),
  ],
})
