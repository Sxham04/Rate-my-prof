"use client"

import { useState } from "react"

export default function FeedbackModal() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSubmit() {
    if (message.trim().length < 5) return
    setStatus("sending")
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, email }),
    })
    setStatus(res.ok ? "sent" : "error")
  }

  function handleClose() {
    setOpen(false)
    setMessage("")
    setEmail("")
    setStatus("idle")
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 text-xs font-semibold text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition"
      >
        Report an issue
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={handleClose}>
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Report an issue</h2>
                <p className="text-xs text-gray-500 mt-0.5">Wrong info, missing data, or anything else</p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {status === "sent" ? (
              // Success state
              <div className="px-6 py-10 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900">Thanks for the feedback!</p>
                <p className="text-xs text-gray-500 mt-1">We'll look into it and fix it as soon as possible.</p>
                <button
                  onClick={handleClose}
                  className="mt-6 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Close
                </button>
              </div>
            ) : (
              // Form
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Your message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Professor X is listed under the wrong department..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ color: "#111827" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Your email <span className="text-gray-400 font-normal">(optional — for follow-up)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@dituniversity.edu.in"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: "#111827" }}
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={status === "sending" || message.trim().length < 5}
                  className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending..." : "Send feedback"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}