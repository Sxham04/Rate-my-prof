import Link from 'next/link'
import { prisma } from '../lib/db'

export default async function HomePage() {
  const professorCount = await prisma.professor.count()
  const reviewCount = await prisma.review.count()

  const schools = await prisma.professor.groupBy({
    by: ['school'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Find the right professor.<br />Before you sign up.
          </h1>
          <p className="mt-5 text-blue-100 text-xl max-w-xl mx-auto">
            Real reviews from DIT University students. Search any professor and read what your peers actually think.
          </p>

          {/* Search bar — navigates to /professors?q=... */}
          <form action="/professors" method="get" className="mt-10 flex gap-3 max-w-lg mx-auto">
            <input
              name="q"
              type="text"
              placeholder="Search a professor or course..."
              className="flex-1 px-5 py-3.5 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              style={{ color: '#111827' }}
            />
            <button
              type="submit"
              className="bg-white text-blue-700 font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-blue-50 transition shadow-lg"
            >
              Search
            </button>
          </form>

          {/* Stats bar */}
          <div className="mt-10 flex justify-center gap-10 text-blue-100 text-sm">
            <div>
              <span className="text-white text-2xl font-bold block">{professorCount}</span>
              Professors
            </div>
            <div>
              <span className="text-white text-2xl font-bold block">{schools.length}</span>
              Schools
            </div>
            <div>
              <span className="text-white text-2xl font-bold block">{reviewCount}</span>
              Reviews
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Search a professor", desc: "Find any DIT University faculty member by name, department, or course." },
            { step: "2", title: "Read real reviews", desc: "See ratings and written feedback from students who've actually taken their class." },
            { step: "3", title: "Share your experience", desc: "Log in with your college email and help the next batch of students choose well." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by school */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by school</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((s) => (
              <Link
                key={s.school}
                href={`/professors?school=${encodeURIComponent(s.school)}`}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
              >
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{s.school}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{s._count.id}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to find your next professor?</h2>
        <p className="text-gray-500 mt-3 mb-8">Browse all 225 faculty members and find the right fit for your semester.</p>
        <Link
          href="/professors"
          className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition text-sm inline-block"
        >
          Browse all professors →
        </Link>
      </section>

    </main>
  )
}