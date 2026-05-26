import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sign in failed</h1>
        <p className="text-gray-500 mt-3 text-sm leading-relaxed">
          Only @dituniversity.edu.in email addresses are allowed.
          Please use your official college email.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition"
        >
          Try again
        </Link>
      </div>
    </main>
  )
}