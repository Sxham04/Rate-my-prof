import { prisma } from '@/lib/db'
import ProfessorsClient from '@/components/professors/ProfessorsClient'

interface PageProps {
  searchParams: Promise<{ q?: string; school?: string }>
}

export default async function ProfessorsPage({ searchParams }: PageProps) {
  const { q, school } = await searchParams

  const professors = await prisma.professor.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      designation: true,
      school: true,
      department: true,
      courses: true,
      photoUrl: true,
      reviews: {
        select: { overallRating: true }
      },
    },
  })

  const professorsWithRatings = professors.map((p) => {
    const reviews = p.reviews
    const totalReviews = reviews.length
    const avgRating = totalReviews
      ? parseFloat((reviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews).toFixed(1))
      : null

    const { reviews: _, ...rest } = p
    return { ...rest, avgRating, totalReviews }
  })

  return (
    <ProfessorsClient
      professors={professorsWithRatings}
      initialSearch={q ?? ""}
      initialSchool={school ?? "All Schools"}
    />
  )
}