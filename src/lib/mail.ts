import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = "Northernware <noreply@northernware.ph>"
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export function getBrandedTemplate(content: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf8; border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
        <h1 style="color: #fcfbf8; margin: 0; font-size: 24px; letter-spacing: -1px; text-transform: lowercase;">northernware®</h1>
      </div>
      <div style="padding: 40px; color: #1a1a1a;">
        ${content}
      </div>
      <div style="background-color: #f1efea; padding: 20px; text-align: center; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 2px;">
        Northernware Internal Tool — Automated Notification
      </div>
    </div>
  `;
}
