import sgMail from "@sendgrid/mail";
import { env } from "../config/env";

const appUrl = env.APP_URL.replace(/\/$/, "");

function isSendGridEnabled() {
  return Boolean(env.SENDGRID_API_KEY && env.SENDGRID_API_KEY.trim().length > 0);
}

if (isSendGridEnabled()) {
  sgMail.setApiKey(env.SENDGRID_API_KEY as string);
}

function renderTemplate(params: { title: string; intro: string; buttonText: string; buttonUrl: string }) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-top:6px solid #059669;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:24px;">
                <h2 style="margin:0 0 12px;color:#111827;">${params.title}</h2>
                <p style="margin:0 0 18px;color:#374151;line-height:1.6;">${params.intro}</p>
                <a href="${params.buttonUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:700;">${params.buttonText}</a>
                <p style="margin:18px 0 0;color:#6b7280;font-size:12px;">If the button does not work, copy this URL: ${params.buttonUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendMail(to: string, subject: string, html: string) {
  if (!isSendGridEnabled()) {
    console.log(`[email-disabled] to=${to} subject="${subject}"`);
    return;
  }

  await sgMail.send({
    to,
    from: {
      email: env.FROM_EMAIL,
      name: env.FROM_NAME
    },
    subject,
    html
  });
}

export class EmailService {
  static async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await sendMail(
      email,
      "Verify your SIWES Connect account",
      renderTemplate({
        title: "Verify Your Email",
        intro: "Welcome to SIWES Connect. Verify your email to activate your account and continue.",
        buttonText: "Verify Email",
        buttonUrl: verifyUrl
      })
    );
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await sendMail(
      email,
      "Reset your SIWES Connect password",
      renderTemplate({
        title: "Password Reset Request",
        intro: "Use the button below to reset your password. This link expires in one hour.",
        buttonText: "Reset Password",
        buttonUrl: resetUrl
      })
    );
  }
}
