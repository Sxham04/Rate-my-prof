import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import RateButton from '@/components/reviews/RateButton'
import ReviewList from '@/components/reviews/ReviewList'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const prof = await prisma.professor.findUnique({ where: { id }, select: { name: true } })
  return {
    title: prof ? `${prof.name} — DIT University Reviews` : 'Professor Not Found',
  }
}

export default async function ProfessorProfilePage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const professor = await prisma.professor.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!professor) notFound()

  const reviewCount = professor.reviews.length
  const avg = (field: 'overallRating' | 'teachingQuality' | 'approachability' | 'fairness') =>
    reviewCount
      ? (professor.reviews.reduce((s, r) => s + r[field], 0) / reviewCount).toFixed(1)
      : null

  const avgOverall  = avg('overallRating')
  const avgTeaching = avg('teachingQuality')
  const avgApproach = avg('approachability')
  const avgFairness = avg('fairness')

  const hasAlreadyReviewed = session?.user?.id
    ? professor.reviews.some((r) => r.userId === session.user.id)
    : false

  const ratingColor = avgOverall
    ? parseFloat(avgOverall) >= 4 ? 'text-emerald-600'
    : parseFloat(avgOverall) >= 3 ? 'text-amber-500'
    : 'text-red-500'
    : 'text-gray-300'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

        {/* Back */}
        <Link href="/professors" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All professors
        </Link>

        {/* Profile header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-start">

            {/* Avatar + Info */}
            <div className="flex gap-3 items-start flex-1 min-w-0">
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                {professor.photoUrl ? (
                  <Image src={professor.photoUrl} alt={professor.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-extrabold text-gray-900 leading-tight">{professor.name}</h1>
                {professor.designation && (
                  <p className="text-blue-600 font-medium text-xs mt-0.5">{professor.designation}</p>
                )}
                <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-gray-500">
                  {professor.school && <span>{professor.school}</span>}
                  {professor.department && <span>{professor.department}</span>}
                  {professor.email && (
                    <a href={`mailto:${professor.email}`} className="text-blue-600 hover:underline truncate">
                      {professor.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Rating card */}
            <div className="w-full md:w-40 flex-shrink-0 border border-gray-200 rounded-xl p-3 text-center bg-gray-50">
              <div className={`text-3xl font-black mb-0.5 ${ratingColor}`}>
                {avgOverall ?? 'N/A'}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {reviewCount} {reviewCount === 1 ? 'rating' : 'ratings'}
              </p>
              {reviewCount > 0 && (
                <div className="text-xs text-gray-500 space-y-1 text-left border-t border-gray-200 pt-2 mb-2">
                  {[
                    { label: 'Teaching', val: avgTeaching },
                    { label: 'Approachability', val: avgApproach },
                    { label: 'Fairness', val: avgFairness },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span className="font-semibold text-gray-700">{val}</span>
                    </div>
                  ))}
                </div>
              )}
              <RateButton
                professorId={professor.id}
                professorName={professor.name}
                isLoggedIn={!!session?.user}
                hasAlreadyReviewed={hasAlreadyReviewed}
              />
              {!session?.user && (
                <p className="text-xs text-gray-400 mt-1.5">Login to leave a review</p>
              )}
            </div>

          </div>
        </div>

        {/* Body — single column on mobile, 3-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Main content */}
          <div className="md:col-span-2 space-y-4">

            {professor.bio && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-2">About</h2>
                <p className="text-xs text-gray-600 leading-relaxed">{professor.bio}</p>
              </div>
            )}

            {professor.courses.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Courses Taught</h2>
                <div className="flex flex-wrap gap-1.5">
                  {professor.courses.map((course, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg border border-blue-100">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Student Reviews
                {reviewCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">({reviewCount})</span>
                )}
              </h2>
              <ReviewList reviews={professor.reviews} />
            </div>

          </div>

          {/* Sidebar — shows above reviews on mobile via order */}
          <div className="md:col-span-1 order-first md:order-none">
            {professor.email && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Credentials</h2>
                <div className="text-xs text-gray-600">
                  <span className="block font-semibold text-gray-800 mb-1">Email</span>
                  <a href={`mailto:${professor.email}`} className="text-blue-600 hover:underline break-all">
                    {professor.email}
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}