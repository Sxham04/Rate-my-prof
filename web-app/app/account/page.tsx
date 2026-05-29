import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth'
import AccountClient from '@/components/account/AccountClient'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { professor: { select: { id: true, name: true, school: true } } },
  })

  const initial = session.user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Page header */}
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black mb-4">
                {initial}
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-gray-900 break-all">{session.user.email}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Reviews</span>
                  <span className="font-semibold text-gray-900">{reviews.length}</span>
                </div>
              </div>

              <form action={async () => {
                "use server"
                await signOut({ redirectTo: '/' })
              }} className="mt-5">
                <button
                  type="submit"
                  className="w-full text-sm font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Reviews */}
          <div className="md:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">
                My Reviews
                <span className="ml-2 text-xs font-normal text-gray-400">({reviews.length})</span>
              </h2>
              <AccountClient reviews={reviews} />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}