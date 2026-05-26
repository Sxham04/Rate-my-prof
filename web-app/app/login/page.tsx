"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const ALLOWED_DOMAIN = "dituniversity.edu.in"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError("Only @dituniversity.edu.in email addresses are allowed.")
      return
    }

    setLoading(true)
    const result = await signIn("resend", {
      email,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      setError("Something went wrong. Please try again.")
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            We sent a magic link to <span className="font-medium text-gray-700">{email}</span>.
            Click the link in the email to sign in.
          </p>
          <p className="text-xs text-gray-400 mt-6">
            Did not receive it? Check your spam folder or{" "}
            <button onClick={() => setSent(false)} className="text-blue-600 hover:underline">
              try again
            </button>.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to rate professors</h1>
          <p className="text-gray-500 text-sm mt-2">
            Use your DIT University email. No password needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              College email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@dituniversity.edu.in"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#111827' }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Sending link..." : "Send magic link"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Only @dituniversity.edu.in addresses are accepted.
        </p>
      </div>
    </main>
  )
}