import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = 'RoofSolar <noreply@roofsolars.netlify.app>';

export async function sendLeadConfirmation(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'We received your quote request — RoofSolar',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <div style="width:32px;height:32px;background:#FACC15;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px">RS</div>
          <span style="font-weight:700;font-size:18px">RoofSolar</span>
        </div>
        <h1 style="font-size:22px;color:#111827;margin:0 0 8px">Hi ${name},</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
          We've received your request for installer quotes. We'll connect you with certified solar
          installers in your area within 1–2 business days.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
          In the meantime, you can revisit your solar analysis or unlock your full pro report for £3.99.
        </p>
        <a href="https://roofsolars.netlify.app/calculator" style="display:inline-block;background:#FACC15;color:#111827;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;font-size:15px">
          New analysis
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
          RoofSolar · contact@roofsolars.netlify.app · You are receiving this because you submitted a quote request.
        </p>
      </div>
    `,
  });
}

export async function sendInstallerWaitlistConfirmation(to: string, companyName: string) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'You\'re on the RoofSolar installer waitlist',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <div style="width:32px;height:32px;background:#FACC15;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px">RS</div>
          <span style="font-weight:700;font-size:18px">RoofSolar</span>
        </div>
        <h1 style="font-size:22px;color:#111827;margin:0 0 8px">Thanks, ${companyName}!</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
          You've been added to the RoofSolar installer waitlist. We'll reach out when the
          installer network launches in your region.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6">
          Expect warm, financially-informed leads from homeowners who have already modelled
          their solar investment.
        </p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
          RoofSolar · contact@roofsolars.netlify.app
        </p>
      </div>
    `,
  });
}

export async function sendProReportEmail(
  to: string,
  calculationId: string,
  address: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your RoofSolar pro report is ready',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <div style="width:32px;height:32px;background:#FACC15;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px">RS</div>
          <span style="font-weight:700;font-size:18px">RoofSolar</span>
        </div>
        <h1 style="font-size:22px;color:#111827;margin:0 0 8px">Your pro report is ready</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px">
          <strong>Property:</strong> ${address}
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
          Your full 10-year solar investment analysis is ready to download. Click below to access it.
        </p>
        <a href="https://roofsolars.netlify.app/results/${calculationId}?pro=true"
           style="display:inline-block;background:#111827;color:#FACC15;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;font-size:15px">
          View &amp; download report
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
          RoofSolar · contact@roofsolars.netlify.app · This email was sent because you purchased a pro report.
        </p>
      </div>
    `,
  });
}
