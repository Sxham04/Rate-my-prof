import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function ProfessorProfilePage({ params }: Props) {
  const resolvedParams = await params;

  const professor = await prisma.professor.findUnique({
    where: { id: resolvedParams.id },
    // include: { reviews: true } <-- We will uncomment this when reviews exist!
  })

  if (!professor) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Back Button */}
        <Link href="/professors" className="text-sm text-blue-600 hover:underline mb-8 inline-block">
          &larr; Back to all professors
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            
            {/* Left: Info & Avatar */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Large Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 flex-shrink-0 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {professor.photoUrl ? (
                  <img src={professor.photoUrl} alt={professor.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Text Data */}
              <div className="pt-2">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{professor.name}</h1>
                {professor.designation && (
                  <p className="text-xl text-blue-600 font-medium mt-2">{professor.designation}</p>
                )}
                <div className="mt-4 flex flex-col gap-2 text-gray-600">
                  {professor.school && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">School:</span> {professor.school}
                    </p>
                  )}
                  {professor.department && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Department:</span> {professor.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Rating Stub */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center min-w-[200px] w-full md:w-auto">
              <div className="text-5xl font-black text-gray-300 mb-2">N/A</div>
              <p className="text-sm text-gray-500 font-medium">0 Ratings</p>
              <button disabled className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-xl opacity-50 cursor-not-allowed">
                Rate Professor
              </button>
              <p className="text-xs text-gray-400 mt-2">Login required</p>
            </div>
            
          </div>
        </div>

        {/* Details Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Bio & Courses */}
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
          </div>

          {/* Right Column: Reviews (Placeholder) */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h2>
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p className="text-gray-500 font-medium">No reviews yet.</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}