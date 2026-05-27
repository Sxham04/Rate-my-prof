"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  professorId: string
  professorName: string
  onClose: () => void
}

const CHARACTERISTICS = [
  { key: "teachingQuality", label: "Teaching Quality", desc: "How well they explain concepts" },
  { key: "approachability", label: "Approachability", desc: "Willingness to help outside class" },
  { key: "fairness", label: "Fairness", desc: "Grading transparency and consistency" },
] as const

type RatingKey = "teachingQuality" | "approachability" | "fairness"

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <svg
              className={`w-7 h-7 transition-colors ${star <= active ? "text-amber-400" : "text-gray-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <span className={`text-sm font-medium w-16 ${active ? "text-amber-500" : "text-transparent"}`}>
        {LABELS[active]}
      </span>
    </div>
  )
}

export default function ReviewForm({ professorId, professorName, onClose }: Props) {
  const router = useRouter()
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    teachingQuality: 0,
    approachability: 0,
    fairness: 0,
  })
  const [content, setContent] = useState("")
  const [courseTaken, setCourseTaken] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const allRated = Object.values(ratings).every((r) => r > 0)
  const overallPreview = allRated
    ? ((ratings.teachingQuality + ratings.approachability + ratings.fairness) / 3).toFixed(1)
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!allRated) {
      setError("Please rate all three characteristics.")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professorId, ...ratings, content, courseTaken, isAnonymous }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error || "Something went wrong.")
      return
    }
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                Writing a review for
              </p>
              <h2 className="text-xl font-extrabold text-gray-900">{professorName}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[65vh]">

          {/* Characteristics */}
          <div className="space-y-5">
            {CHARACTERISTICS.map(({ key, label, desc }) => (
              <div key={key} className="space-y-1">
                <p className="text-sm font-bold text-gray-900 text-left">{label}</p>
                <p className="text-xs text-gray-600 text-left">{desc}</p>
                <div className="pt-1">
                  <StarPicker
                    value={ratings[key]}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall rating preview */}
          {overallPreview && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
              <span className="text-sm font-semibold text-blue-700">Overall Rating</span>
              <span className="text-xl font-black text-blue-700">
                {overallPreview} <span className="text-sm font-normal">/ 5</span>
              </span>
            </div>
          )}

          {/* Course taken */}
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-gray-900 text-left">
              Course Taken <span className="text-gray-500 font-normal">(optional)</span>
            </p>
            <input
              type="text"
              value={courseTaken}
              onChange={(e) => setCourseTaken(e.target.value)}
              placeholder="e.g. Data Structures"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: "#111827" }}
            />
          </div>

          {/* Written review */}
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-gray-900 text-left">
              Review <span className="text-gray-500 font-normal">(optional)</span>
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ color: "#111827" }}
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Post anonymously</p>
              <p className="text-xs text-gray-600">Your name won't appear on the review</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-4 ${isAnonymous ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 pt-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={submitting || !allRated}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

      </div>
    </div>
  )
}