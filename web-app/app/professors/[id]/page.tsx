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

  // Compute aggregated ratings
  const reviewCount = professor.reviews.length
  const avgOverall = reviewCount
    ? (professor.reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount).toFixed(1)
    : null
  const avgTeaching = reviewCount
    ? (professor.reviews.reduce((sum, r) => sum + r.teachingQuality, 0) / reviewCount).toFixed(1)
    : null
  const avgApproach = reviewCount
    ? (professor.reviews.reduce((sum, r) => sum + r.approachability, 0) / reviewCount).toFixed(1)
    : null
  const avgFairness = reviewCount
    ? (professor.reviews.reduce((sum, r) => sum + r.fairness, 0) / reviewCount).toFixed(1)
    : null

  // Check if logged-in user already reviewed
  const hasAlreadyReviewed = session?.user?.id
    ? professor.reviews.some((r) => r.userId === session.user.id)
    : false

  const ratingColor = avgOverall
    ? parseFloat(avgOverall) >= 4
      ? 'text-emerald-600'
      : parseFloat(avgOverall) >= 3
      ? 'text-amber-500'
      : 'text-red-500'
    : 'text-gray-300'

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">

        <Link href="/professors" className="text-sm text-blue-600 hover:underline mb-8 inline-block">
          &larr; Back to all professors
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">

            {/* Left: Avatar + Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 flex-shrink-0 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {professor.photoUrl ? (
                  <Image
                    src={professor.photoUrl}
                    alt={professor.name}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <div className="pt-2">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{professor.name}</h1>
                {professor.designation && (
                  <p className="text-xl text-blue-600 font-medium mt-2">{professor.designation}</p>
                )}
                <div className="mt-4 flex flex-col gap-2 text-gray-600">
                  {professor.school && (
                    <p><span className="font-semibold text-gray-900">School:</span> {professor.school}</p>
                  )}
                  {professor.department && (
                    <p><span className="font-semibold text-gray-900">Department:</span> {professor.department}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Rating Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center min-w-[200px] w-full md:w-auto flex flex-col">
              <div className={`text-5xl font-black mb-1 ${ratingColor}`}>
                {avgOverall ?? 'N/A'}
              </div>
              <p className="text-sm text-gray-500 font-medium mb-2">
                {reviewCount} {reviewCount === 1 ? 'Rating' : 'Ratings'}
              </p>

              {/* Breakdown */}
              {reviewCount > 0 && (
                <div className="text-xs text-gray-500 space-y-1 mb-4 text-left border-t border-gray-200 pt-3">
                  <div className="flex justify-between"><span>Teaching</span><span className="font-semibold text-gray-700">{avgTeaching}</span></div>
                  <div className="flex justify-between"><span>Approachability</span><span className="font-semibold text-gray-700">{avgApproach}</span></div>
                  <div className="flex justify-between"><span>Fairness</span><span className="font-semibold text-gray-700">{avgFairness}</span></div>
                </div>
              )}

              <RateButton
                professorId={professor.id}
                professorName={professor.name}
                isLoggedIn={!!session?.user}
                hasAlreadyReviewed={hasAlreadyReviewed}
              />
              {!session?.user && (
                <p className="text-xs text-gray-400 mt-2">Login to leave a review</p>
              )}
            </div>

          </div>
        </div>

        {/* Details Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left: Bio + Courses */}
          <div className="md:col-span-2 space-y-8">
            {professor.bio && (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{professor.bio}</p>
              </div>
            )}

            {professor.courses.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Courses Taught</h2>
                <div className="flex flex-wrap gap-2">
                  {professor.courses.map((course, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-xl border border-blue-100">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Student Reviews
                {reviewCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">({reviewCount})</span>
                )}
              </h2>
              <ReviewList reviews={professor.reviews} />
            </div>
          </div>

          {/* Right: Credentials */}
          <div className="md:col-span-1">
            {professor.email && (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Credentials</h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Email</span>
                    <a href={`mailto:${professor.email}`} className="text-blue-600 hover:underline break-all">
                      {professor.email}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}