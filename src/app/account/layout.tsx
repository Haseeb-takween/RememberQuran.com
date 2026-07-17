import { redirect } from "next/navigation"
import { auth } from "@/auth"
import type { ReactNode } from "react"

export const dynamic = "force-dynamic"

/**
 * Account area requires a session. Reading the Quran never uses this layout.
 */
export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account")
  }
  return children
}
