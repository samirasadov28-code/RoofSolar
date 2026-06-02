import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = 'RoofSolar <onboarding@resend.dev>';

export async function sendLeadConfirmation(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'We received your quote request — RoofSolar',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <img src="https://roofsolar.netlify.app/logo-192.png" alt="RoofSolar" width="32" height="32" style="border-radius:50%;object-fit:cover" />
          <span style="font-weight:700;font-size:18px">RoofSolar</span>
        </div>
        <h1 style="font-size:22px;color:#111827;margin:0 0 8px">Hi ${name},</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
          We've received your request for installer quotes. We'll connect you with qualified solar
          installers in your area within 1–2 business days.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
          In the meantime, you can revisit your solar analysis or unlock your full pro report at the price shown on your results page.
        </p>
        <a href="https://roofsolar.netlify.app/calculator" style="display:inline-block;background:#FACC15;color:#111827;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;font-size:15px">
          New analysis
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
          RoofSolar · contact@roofsolar.netlify.app · You are receiving this because you submitted a quote request.
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
          <img src="https://roofsolar.netlify.app/logo-192.png" alt="RoofSolar" width="32" height="32" style="border-radius:50%;object-fit:cover" />
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
          RoofSolar · contact@roofsolar.netlify.app
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
          <img src="https://roofsolar.netlify.app/logo-192.png" alt="RoofSolar" width="32" height="32" style="border-radius:50%;object-fit:cover" />
          <span style="font-weight:700;font-size:18px">RoofSolar</span>
        </div>
        <h1 style="font-size:22px;color:#111827;margin:0 0 8px">Your pro report is ready</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px">
          <strong>Property:</strong> ${address}
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
          Your full 25-year solar investment analysis is ready to download. Click below to access it.
        </p>
        <a href="https://roofsolar.netlify.app/results/${calculationId}?pro=true"
           style="display:inline-block;background:#111827;color:#FACC15;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;font-size:15px">
          View &amp; download report
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:32px">
          RoofSolar · contact@roofsolar.netlify.app · This email was sent because you purchased a pro report.
        </p>
      </div>
    `,
  });
}

const STARS = ['😞', '😕', '😐', '😊', '😍'];

export async function sendFeedbackNotification(rating: number, message: string | null, page: string | null) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: 'finmodelup@gmail.com',
    subject: `RoofSolar feedback — ${rating}/5 ${STARS[rating - 1]}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <img src="https://roofsolar.netlify.app/logo-192.png" alt="RoofSolar" width="28" height="28" style="border-radius:50%;object-fit:cover" />
          <span style="font-weight:700;font-size:16px">RoofSolar — User Feedback</span>
        </div>
        <table style="border-collapse:collapse;width:100%">
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;width:110px">Rating</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb">${rating} / 5 &nbsp; ${STARS[rating - 1]}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Page</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280">${page || '/'}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;vertical-align:top">Message</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb">${message ? message.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '<span style="color:#9ca3af">—</span>'}</td>
          </tr>
        </table>
        <p style="color:#9ca3af;font-size:11px;margin-top:24px">RoofSolar · automated feedback notification</p>
      </div>
    `,
  });
}
