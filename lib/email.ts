import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

function createTransporter() {
  // In development, log to console if no SMTP configured
  if (!process.env.SMTP_HOST) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transporter = createTransporter()

  if (!transporter) {
    // Dev fallback: log to console
    console.log('\n📧 [EMAIL STUB] ─────────────────────────────')
    console.log(`  To:      ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body:\n${html.replace(/<[^>]+>/g, '')}`)
    console.log('─────────────────────────────────────────────\n')
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@tennisrally.app',
    to,
    subject,
    html,
  })
}

export function passwordResetEmailHtml(resetUrl: string, name?: string | null) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #166534;">🎾 Tennis Progress Tracker</h2>
      <p>Hi ${name ?? 'there'},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p>
        <a href="${resetUrl}" style="background: #16a34a; color: white; padding: 12px 24px;
           text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        This link expires in 1 hour. If you didn't request this, you can ignore this email.
      </p>
    </div>
  `
}
