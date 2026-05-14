import { prisma } from '@/lib/db'
import ProfessorsClient from '@/components/professors/ProfessorsClient'

export const metadata = {
  title: 'Browse Professors — DIT University',
  description: 'Search and filter all DIT University faculty by school, department, and course.',
}

// Next.js 15 expects searchParams to be a Promise
export default async function ProfessorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; school?: string }>
}) {
  // Await the URL parameters
  const resolvedParams = await searchParams;

  const professors = await prisma.professor.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      designation: true,
      school: true,
      department: true,
      courses: true,
      photoUrl: true, // <-- Fetching the image URL
      // _count: { select: { reviews: true } },
      // reviews: { select: { rating: true } },
    },
  })

  const professorsWithRatings = professors.map((p) => ({
    ...p,
    avgRating: null,
    totalReviews: 0,
  }))

  return (
    <ProfessorsClient 
      professors={professorsWithRatings} 
      initialSearch={resolvedParams.q}
      initialSchool={resolvedParams.school}
    />
  )
}