import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await sendWelcomeEmail({ to: email, name })
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('send-welcome error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}