"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateCredentials } from "@/lib/auth/credentials"
import { safeNextPath } from "@/lib/auth/safe-next"
import { cn } from "@/lib/utils"

const fieldLabel =
  "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"

function redirectAfterAuth(path: string) {
  // Full navigation guarantees the fresh Auth.js cookie is read by the server
  // and avoids staying on /login or /register with only the navbar updated.
  window.location.assign(path)
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = safeNextPath(searchParams.get("next"), "/account")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = validateCredentials(email, password)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    setPending(true)
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: next,
      })

      if (!result || result.error) {
        // Keep the email, clear the password, and re-enable the form so the
        // user can retry immediately.
        setError("Invalid email or password.")
        setPassword("")
        setPending(false)
        return
      }

      // Leave `pending` on while the full-page redirect happens.
      redirectAfterAuth(next)
    } catch {
      setError("Something went wrong. Please try again.")
      setPassword("")
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="login-email" className={fieldLabel}>
          Email
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-xs font-medium tracking-wide text-muted-foreground"
          >
            Password
          </label>
          <Link
            href="/reset"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className={cn("h-11 w-full text-sm")}
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
