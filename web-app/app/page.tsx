import Link from 'next/link'
import { prisma } from '@/lib/db'
import FeedbackModal from '@/components/FeedbackModal'

const FAQS = [
  {
    q: "Why are some professors missing?",
    a: "Our data was collected from the official DIT University website. Professors whose profiles were not publicly listed or were added after our last update may not appear. We're working on keeping the list current."
  },
  {
    q: "Why are some courses taught missing or incorrect?",
    a: "Course information was scraped automatically and may be incomplete or outdated. Professors sometimes teach courses not listed on their official profile. If you spot an error, please report it using the link below."
  },
  {
    q: "Why are some department names wrong?",
    a: "Department names were extracted from professor bios and may contain inconsistencies from the source data. We've normalised them as best we can, but some edge cases remain."
  },
  {
    q: "Are reviews anonymous?",
    a: "Yes — by default all reviews are posted anonymously. You can choose to display your name when submitting a review, but your identity is never shared without your consent."
  },
  {
    q: "Who can leave a review?",
    a: "Only students with a verified @dituniversity.edu.in email address can submit reviews. This ensures all feedback comes from real DIT University students."
  },
  {
    q: "Can a professor be removed or edited?",
    a: "If you believe a professor's information is incorrect or a profile should be removed, please use the Report an Issue link below and we'll look into it."
  },
]

export default async function HomePage() {
  const professorCount = await prisma.professor.count()
  const reviewCount = await prisma.review.count()
  const schools = await prisma.professor.groupBy({
    by: ['school'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })
  const validSchools = schools.filter(s => s.school && s.school !== 'Unknown')

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <span className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            DIT University · Student Reviews
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Find the right professor<br className="hidden md:block" /> before you sign up.
          </h1>
          <p className="mt-4 text-blue-100 text-base max-w-xl mx-auto leading-relaxed">
            Real ratings from real students. Search any professor and see what your peers actually think.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto items-stretch justify-center">
            <form action="/professors" method="get" className="flex flex-1 shadow-lg rounded-2xl overflow-hidden">
              <input
                name="q"
                type="text"
                placeholder="Search by name, course, or department..."
                className="flex-1 px-5 py-3.5 text-sm bg-white focus:outline-none"
                style={{ color: '#111827' }}
              />
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3.5 transition whitespace-nowrap"
              >
                Search
              </button>
            </form>
            <Link
              href="/professors"
              className="bg-white hover:bg-gray-50 text-blue-700 text-sm font-semibold px-6 py-3.5 shadow-lg rounded-2xl transition whitespace-nowrap flex items-center justify-center border border-blue-100/20"
            >
              Browse all
            </Link>
          </div>

          <div className="mt-10 flex justify-center gap-12">
            {[
              { value: professorCount, label: 'Professors' },
              { value: validSchools.length, label: 'Schools' },
              { value: reviewCount, label: 'Reviews' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-sm text-blue-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Search a professor', desc: 'Find any DIT University faculty member by name, department, or course.' },
              { n: '2', title: 'Read real reviews', desc: 'See ratings across teaching quality, approachability, and fairness.' },
              { n: '3', title: 'Share your experience', desc: 'Log in with your college email and help the next batch of students choose well.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by school */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Browse by school</h2>
            <Link href="/professors" className="text-sm text-blue-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {validSchools.map((s) => (
              <Link
                key={s.school}
                href={`/professors?school=${encodeURIComponent(s.school)}`}
                className="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 leading-snug">
                  {s.school}
                </span>
                <span className="ml-3 flex-shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {s._count.id}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-900 mb-2">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to find your professor?</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">
          Browse all {professorCount} faculty members across {validSchools.length} schools.
        </p>
        <Link
          href="/professors"
          className="inline-block bg-blue-600 text-white text-sm font-semibold px-7 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Browse all professors →
        </Link>
      </section>

      {/* Footer */}
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400 text-center sm:text-left">
          Built by DIT University students. Data sourced from{' '}
          <a href="https://www.dituniversity.edu.in/faculty" target="_blank" rel="noopener noreferrer" className="hover:underline">
            dituniversity.edu.in
          </a>
          . Not officially affiliated with DIT University.
        </p>
        <FeedbackModal />
      </div>
    </footer>

    </main>
  )
}