import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to,
    subject: 'Welcome to JobRadar 🎯',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

            <!-- Brand -->
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#6366F1;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px;">JobRadar 🎯</h1>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:4px 0 0;">Your job search command centre</p>
            </div>

            <!-- Card -->
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;margin-bottom:24px;">
              <div style="text-align:center;font-size:40px;margin-bottom:20px;">👋</div>
              <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px;text-align:center;">Welcome, ${name}!</h2>
              <p style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6;margin:0;text-align:center;">
                Your JobRadar account is ready. Start tracking your applications, set goals, and land that dream job.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard"
                style="display:inline-block;background:linear-gradient(135deg,#6366F1,#818CF8);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:100px;">
                Go to Dashboard →
              </a>
            </div>

            <!-- Footer -->
            <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin:0;line-height:1.6;">
              Hi ${name}, this is an automated message from JobRadar.
            </p>
          </div>
        </body>
      </html>
    `,
  })
}