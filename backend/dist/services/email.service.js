"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const env_1 = require("../config/env");
const appUrl = env_1.env.APP_URL.replace(/\/$/, "");
function isSendGridEnabled() {
    return Boolean(env_1.env.SENDGRID_API_KEY && env_1.env.SENDGRID_API_KEY.trim().length > 0);
}
if (isSendGridEnabled()) {
    mail_1.default.setApiKey(env_1.env.SENDGRID_API_KEY);
}
function renderTemplate(params) {
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
async function sendMail(to, subject, html) {
    if (!isSendGridEnabled()) {
        console.log(`[email-disabled] to=${to} subject="${subject}"`);
        return;
    }
    await mail_1.default.send({
        to,
        from: {
            email: env_1.env.FROM_EMAIL,
            name: env_1.env.FROM_NAME
        },
        subject,
        html
    });
}
class EmailService {
    static async sendVerificationEmail(email, token) {
        const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
        await sendMail(email, "Verify your SIWES Connect account", renderTemplate({
            title: "Verify Your Email",
            intro: "Welcome to SIWES Connect. Verify your email to activate your account and continue.",
            buttonText: "Verify Email",
            buttonUrl: verifyUrl
        }));
    }
    static async sendPasswordResetEmail(email, token) {
        const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
        await sendMail(email, "Reset your SIWES Connect password", renderTemplate({
            title: "Password Reset Request",
            intro: "Use the button below to reset your password. This link expires in one hour.",
            buttonText: "Reset Password",
            buttonUrl: resetUrl
        }));
    }
}
exports.EmailService = EmailService;
