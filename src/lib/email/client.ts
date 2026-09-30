import { Resend } from "resend";

// Lazily initialize Resend client to avoid build-time errors if API key is not yet set
let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY environment variable is not configured. Email will be skipped.");
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export const EMAIL_CONFIG = {
  defaultFrom: process.env.RESEND_FROM_EMAIL || "Marinate360 <no-reply@onboarding.marinate360.com>",
  adminRecipient: process.env.ADMIN_NOTIFICATION_EMAIL || "nexodigitalsolutions@gmail.com",
  appName: "Marinate360",
  loginUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/login`
    : "https://onboarding.marinate360.com/login",
  dashboardUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/dashboard`
    : "https://onboarding.marinate360.com/dashboard",
};

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn(`[Resend] Skipped sending "${options.subject}" to ${options.to} (no API key).`);
      return { success: false, error: "RESEND_API_KEY not set" };
    }

    const fromAddress = options.from || EMAIL_CONFIG.defaultFrom;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const result = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (result.error) {
      console.error("[Resend] Error sending email:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Resend] Email sent successfully to ${recipients.join(", ")} (ID: ${result.data?.id})`);
    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error("[Resend] Unexpected error during send:", err);
    return { success: false, error: err?.message || "Unknown email error" };
  }
}
