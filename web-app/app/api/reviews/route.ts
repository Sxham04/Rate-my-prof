import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const ReviewSchema = z.object({
  professorId:      z.string().min(1),
  teachingQuality:  z.number().int().min(1).max(5),
  approachability:  z.number().int().min(1).max(5),
  fairness:         z.number().int().min(1).max(5),
  content:          z.string().optional().default(""),
  courseTaken:      z.string().optional(),
  isAnonymous:      z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to submit a review." }, { status: 401 })
  }

  // 2. Parse and validate body
  const body = await req.json()
  const result = ReviewSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
  }

  const { professorId, teachingQuality, approachability, fairness, content, courseTaken, isAnonymous } = result.data

  // 3. Check professor exists
  const professor = await prisma.professor.findUnique({ where: { id: professorId } })
  if (!professor) {
    return NextResponse.json({ error: "Professor not found." }, { status: 404 })
  }

  // 4. Prevent duplicate reviews
  const existing = await prisma.review.findFirst({
    where: { professorId, userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this professor." }, { status: 409 })
  }

  // 5. Compute overall rating
  const overallRating = parseFloat(((teachingQuality + approachability + fairness) / 3).toFixed(2))

  // 6. Write to DB
  const review = await prisma.review.create({
    data: {
      professorId,
      userId: session.user.id,
      teachingQuality,
      approachability,
      fairness,
      overallRating,
      content,
      courseTaken: courseTaken || null,
      isAnonymous,
    },
  })

  return NextResponse.json({ success: true, review }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const professorId = searchParams.get("professorId")

  if (!professorId) {
    return NextResponse.json({ error: "professorId is required" }, { status: 400 })
  }

  const reviews = await prisma.review.findMany({
    where: { professorId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  })

  return NextResponse.json(reviews)
}