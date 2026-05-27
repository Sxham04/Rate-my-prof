"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ReviewForm from "./ReviewForm"

interface Props {
  professorId: string
  professorName: string
  isLoggedIn: boolean
  hasAlreadyReviewed: boolean
}

export default function RateButton({ professorId, professorName, isLoggedIn, hasAlreadyReviewed }: Props) {
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    setShowForm(true)
  }

  if (hasAlreadyReviewed) {
    return (
      <div className="mt-4 w-full bg-gray-100 text-gray-500 font-semibold py-2 px-4 rounded-xl text-center text-sm">
        ✓ You reviewed this professor
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded-xl text-center text-sm"
      >
        {isLoggedIn ? "Rate Professor" : "Sign in to Rate"}
      </button>

      {showForm && (
        <ReviewForm
          professorId={professorId}
          professorName={professorName}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}