"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

type Professor = {
  id: string
  name: string
  designation: string | null
  school: string | null
  department: string | null
  courses: string[]
  photoUrl: string | null // <-- Added to type
  avgRating?: number | null
  totalReviews?: number
}

type Props = {
  professors: Professor[]
  initialSearch?: string
  initialSchool?: string
}

const SCHOOLS = [
  "All Schools",
  "School of Computing",
  "School of Engineering & Technology",
  "School of Physical Sciences",
  "School of Liberal Arts & Management",
  "School of Pharmaceutical & Population Health Informatics",
  "School of Architecture and Planning",
  "School of Design",
  "College of Nursing",
  "College of Healthcare Professions",
]

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function RatingBadge({ rating, reviews }: { rating: number | null | undefined; reviews: number | undefined }) {
  if (!rating || !reviews || reviews === 0) {
    return (
      <span className="text-xs text-gray-400 italic">No reviews yet</span>
    )
  }
  const color =
    rating >= 4 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : rating >= 3 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-500 bg-red-50 border-red-200"

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-bold px-2 py-0.5 rounded-md border ${color}`}>
        {rating.toFixed(1)}
      </span>
      <StarDisplay rating={rating} />
      <span className="text-xs text-gray-400">({reviews})</span>
    </div>
  )
}

export default function ProfessorsClient({ 
  professors, 
  initialSearch = "", 
  initialSchool = "All Schools" 
}: Props) {
  
  const [search, setSearch] = useState(initialSearch)
  const [selectedSchool, setSelectedSchool] = useState(initialSchool)
  const [sortBy, setSortBy] = useState<"name" | "rating" | "reviews">("name")

  const filtered = useMemo(() => {
    let list = professors.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.department?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        p.courses.some((c) => c.toLowerCase().includes(search.toLowerCase()))
      const matchSchool =
        selectedSchool === "All Schools" || p.school === selectedSchool
      return matchSearch && matchSchool
    })

    if (sortBy === "rating") {
      list = list.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    } else if (sortBy === "reviews") {
      list = list.sort((a, b) => (b.totalReviews ?? 0) - (a.totalReviews ?? 0))
    } else {
      list = list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [professors, search, selectedSchool, sortBy])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, department, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            {/* School filter */}
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
            >
              {SCHOOLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "rating" | "reviews")}
              className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
            >
              <option value="name">Sort: Name</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="reviews">Sort: Most Reviewed</option>
            </select>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Showing {filtered.length} of {professors.length} professors
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">No professors found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((prof) => (
              <Link href={`/professors/${prof.id}`} key={prof.id}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer h-full flex flex-col">
                  
                  {/* Top section with Avatar */}
                  <div className="flex-grow flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {prof.photoUrl ? (
                        <img src={prof.photoUrl} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Text Info */}
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-snug">{prof.name}</h2>
                      {prof.designation && (
                        <p className="text-blue-600 text-sm font-medium mt-0.5">{prof.designation}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{prof.school}</p>
                      {prof.department && (
                        <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide line-clamp-1">{prof.department}</p>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <RatingBadge rating={prof.avgRating} reviews={prof.totalReviews} />
                  </div>

                  {/* Courses */}
                  {prof.courses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        {prof.courses.slice(0, 3).map((course, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-50 text-gray-600 text-xs px-2.5 py-1 rounded-lg border border-gray-200 truncate max-w-[200px]"
                          >
                            {course}
                          </span>
                        ))}
                        {prof.courses.length > 3 && (
                          <span className="text-xs text-gray-400 py-1 px-1">
                            +{prof.courses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}