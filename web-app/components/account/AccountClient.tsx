"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ReviewForm from "@/components/reviews/ReviewForm"

interface Review {
  id: string
  teachingQuality: number
  approachability: number
  fairness: number
  overallRating: number
  content: string | null
  courseTaken: string | null
  isAnonymous: boolean
  createdAt: Date
  professor: { id: string; name: string; school: string | null }
}

export default function AccountClient({ reviews }: { reviews: Review[] }) {
  const router = useRouter()
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(reviewId: string) {
    if (!confirm("Delete this review? This cannot be undone.")) return
    setDeletingId(reviewId)
    await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" })
    setDeletingId(null)
    router.refresh()
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">You haven't reviewed any professors yet.</p>
        <Link href="/professors" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          Browse professors →
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">

            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <Link href={`/professors/${review.professor.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition">
                  {review.professor.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{review.professor.school}</p>
              </div>
              <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg border flex-shrink-0 ${
                review.overallRating >= 4
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : review.overallRating >= 3
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                {review.overallRating.toFixed(1)}
              </span>
            </div>

            {/* Breakdown */}
            <div className="flex gap-4 text-xs text-gray-500 mb-2">
              <span>Teaching: <strong className="text-gray-700">{review.teachingQuality}</strong></span>
              <span>Approachability: <strong className="text-gray-700">{review.approachability}</strong></span>
              <span>Fairness: <strong className="text-gray-700">{review.fairness}</strong></span>
            </div>

            {review.courseTaken && (
              <span className="inline-block text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg mb-2">
                {review.courseTaken}
              </span>
            )}

            {review.content && (
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.content}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                onClick={() => setEditingReview(review)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(review.id)}
                disabled={deletingId === review.id}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50"
              >
                {deletingId === review.id ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editingReview && (
        <ReviewForm
          professorId={editingReview.professor.id}
          professorName={editingReview.professor.name}
          existingReview={editingReview}
          onClose={() => setEditingReview(null)}
        />
      )}
    </>
  )
}