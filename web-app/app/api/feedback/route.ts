import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { message, email } = await req.json()

  if (!message || message.trim().length < 5) {
    return NextResponse.json({ error: "Message too short." }, { status: 400 })
  }

  await resend.emails.send({
    from: "onboarding@resend.dev",        // swap to your domain once verified
    to: "your@email.com",                  // ← replace with your email
    subject: "DIT Reviews — User Feedback",
    text: `New feedback received:\n\n${message}\n\nFrom: ${email || "Anonymous"}`,
  })

  return NextResponse.json({ success: true })
}