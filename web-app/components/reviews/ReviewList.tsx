import { formatDistanceToNow } from "date-fns"

interface Review {
  id: string
  teachingQuality: number
  approachability: number
  fairness: number
  overallRating: number
  content: string
  courseTaken: string | null
  isAnonymous: boolean
  createdAt: Date
  user: { name: string | null }
}

function MiniStar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= value ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function RatingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <MiniStar value={value} />
        <span className="text-gray-700 font-medium w-4">{value}</span>
      </div>
    </div>
  )
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-gray-500 font-medium">No reviews yet.</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
          {/* Top row: overall rating + date */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                  review.overallRating >= 4
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : review.overallRating >= 3
                    ? "text-amber-700 bg-amber-50 border-amber-200"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}
              >
                {review.overallRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                {review.isAnonymous
                  ? "Anonymous"
                  : review.user.name ?? "Student"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Characteristic breakdown */}
          <div className="space-y-1.5 mb-3">
            <RatingRow label="Teaching Quality" value={review.teachingQuality} />
            <RatingRow label="Approachability" value={review.approachability} />
            <RatingRow label="Fairness" value={review.fairness} />
          </div>

          {/* Course tag */}
          {review.courseTaken && (
            <span className="inline-block text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg mb-3">
              {review.courseTaken}
            </span>
          )}

          {/* Review text */}
          <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
        </div>
      ))}
    </div>
  )
}