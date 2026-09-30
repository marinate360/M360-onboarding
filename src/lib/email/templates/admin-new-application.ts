import { EMAIL_CONFIG } from "../client";
import { wrapInBaseEmailLayout } from "./base-layout";

export type AdminNewApplicationEmailParams = {
  applicationId: string;
  restaurantName: string;
  ownerName: string;
  email: string;
  phone?: string | null;
  packageName?: string;
  cuisines?: string[];
  city?: string;
  submittedAt?: string;
};

export function renderAdminNewApplicationEmail(params: AdminNewApplicationEmailParams): { subject: string; html: string; text: string } {
  const {
    restaurantName,
    ownerName,
    email,
    phone,
    packageName = "Marinate Menu",
    cuisines = [],
    city,
    submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  } = params;

  const subject = `🛎️ New Restaurant Application: ${restaurantName} (${city || "New"})`;

  const contentHtml = `
    <p style="margin: 0 0 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
      A new restaurant onboarding application has been submitted and is awaiting your review.
    </p>

    <!-- Details Table -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; width: 140px; font-weight: 500;">Restaurant:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">${restaurantName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Owner:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${ownerName || "Not specified"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Email:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">
            <a href="mailto:${email}" style="color: #ea580c; text-decoration: none; font-weight: 600;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Phone:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">${phone || "Not specified"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Requested Plan:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #ea580c; font-size: 14px; font-weight: 700;">${packageName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Location:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">${city || "Not specified"}</td>
        </tr>
        ${
          cuisines.length > 0
            ? `
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Cuisines:</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">${cuisines.join(", ")}</td>
        </tr>
        `
            : ""
        }
        <tr>
          <td style="padding: 12px 18px; color: #64748b; font-size: 13px; font-weight: 500;">Submitted:</td>
          <td style="padding: 12px 18px; color: #64748b; font-size: 13px;">${submittedAt}</td>
        </tr>
      </table>
    </div>

    <!-- Review Button -->
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${EMAIL_CONFIG.dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
        Open Admin Dashboard to Review &rarr;
      </a>
    </div>
  `;

  const html = wrapInBaseEmailLayout({
    previewText: `New application: ${restaurantName} by ${ownerName || email}`,
    badge: "Company Alert",
    headerTitle: "New Application Received",
    headerSubtitle: `${restaurantName} is waiting for onboarding verification.`,
    contentHtml,
    footerNotes: "Sent to designated company admin (nexodigitalsolutions@gmail.com).",
  });

  const text = `
New Application Received:
Restaurant: ${restaurantName}
Owner: ${ownerName || "Not specified"}
Email: ${email}
Phone: ${phone || "Not specified"}
Package: ${packageName}
City: ${city || "Not specified"}

Review in Admin Dashboard: ${EMAIL_CONFIG.dashboardUrl}
  `.trim();

  return { subject, html, text };
}
