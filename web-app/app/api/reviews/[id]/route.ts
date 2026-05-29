import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const UpdateSchema = z.object({
  teachingQuality: z.number().int().min(1).max(5),
  approachability: z.number().int().min(1).max(5),
  fairness:        z.number().int().min(1).max(5),
  content:         z.string().optional().default(""),
  courseTaken:     z.string().optional(),
  isAnonymous:     z.boolean(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.review.findUnique({ where: { id } })

  if (!existing) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 })
  }

  // Only the author can edit
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 })
  }

  const body = await req.json()
  const result = UpdateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
  }

  const { teachingQuality, approachability, fairness, content, courseTaken, isAnonymous } = result.data
  const overallRating = parseFloat(((teachingQuality + approachability + fairness) / 3).toFixed(2))

  const updated = await prisma.review.update({
    where: { id },
    data: { teachingQuality, approachability, fairness, overallRating, content, courseTaken: courseTaken || null, isAnonymous },
  })

  return NextResponse.json({ success: true, review: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.review.findUnique({ where: { id } })

  if (!existing) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 })
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 })
  }

  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ success: true })
}