import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendEmail, passwordResetEmailHtml } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validations/schemas'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid email' },
        { status: 400 }
      )
    }

    const { email } = parsed.data
    const normalizedEmail = email.toLowerCase()

    // Always respond with success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: tokenExpiry,
        },
      })

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

      await sendEmail({
        to: user.email,
        subject: '🎾 Reset your Tennis Tracker password',
        html: passwordResetEmailHtml(resetUrl, user.name),
      })
    }

    return NextResponse.json({
      message: 'If an account exists for this email, a reset link has been sent.',
    })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
