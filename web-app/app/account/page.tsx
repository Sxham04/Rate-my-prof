import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { professor: { select: { id: true, name: true, school: true } } },
  })

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-500 text-sm mt-1">{session.user.email}</p>
            </div>
            <form action={async () => {
              "use server"
              await signOut({ redirectTo: '/' })
            }}>
              <button
                type="submit"
                className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            My Reviews
            <span className="ml-2 text-sm font-normal text-gray-400">({reviews.length})</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">You have not reviewed any professors yet.</p>
              <Link href="/professors" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                Browse professors →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/professors/${review.professor.id}`} className="hover:underline">
                      <p className="font-semibold text-gray-900">{review.professor.name}</p>
                      <p className="text-xs text-gray-400">{review.professor.school}</p>
                    </Link>
                    <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                      review.overallRating >= 4
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : review.overallRating >= 3
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-red-600 bg-red-50 border-red-200'
                    }`}>
                      {review.overallRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                    <div className="flex gap-4">
                      <span>Teaching: <strong>{review.teachingQuality}</strong></span>
                      <span>Approachability: <strong>{review.approachability}</strong></span>
                      <span>Fairness: <strong>{review.fairness}</strong></span>
                    </div>
                  </div>
                  {review.courseTaken && (
                    <span className="inline-block text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg mb-2">
                      {review.courseTaken}
                    </span>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}