import { wrapInBaseEmailLayout } from "./base-layout";

export type CustomerApplicationSubmittedEmailParams = {
  restaurantName: string;
  ownerName: string;
  packageName?: string;
};

export function renderCustomerApplicationSubmittedEmail(params: CustomerApplicationSubmittedEmailParams): { subject: string; html: string; text: string } {
  const { restaurantName, ownerName, packageName = "Marinate Menu" } = params;

  const subject = `📋 Application Received: ${restaurantName} (Under Review)`;

  const contentHtml = `
    <p style="margin: 0 0 18px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong style="color: #0f172a;">${ownerName || "Partner"}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
      Thank you for applying to partner with Marinate360 for <strong style="color: #0f172a;">${restaurantName}</strong>. We have successfully received your registration and documentation.
    </p>

    <!-- Status Pill Card -->
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 20px 24px; margin: 26px 0;">
      <div style="margin-bottom: 8px;">
        <span style="background-color: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 6px;">
          Status: Under Review ⏳
        </span>
      </div>
      <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        Our team is actively reviewing your legal records, brand assets, and requested plan (<strong>${packageName}</strong>). Reviews typically complete within 24 hours.
      </p>
    </div>

    <!-- What to Expect Next -->
    <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 28px;">
      <h3 style="margin: 0 0 14px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        What Happens Next?
      </h3>
      <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
        <li><strong>Verification:</strong> Our team ensures your store domain and documents are validated.</li>
        <li><strong>Activation & Credentials:</strong> As soon as approved, you will receive an activation email with your <strong>login credentials and temporary password</strong>.</li>
        <li><strong>Launch:</strong> Log in to upload your menu and print QR codes.</li>
      </ol>
    </div>
  `;

  const html = wrapInBaseEmailLayout({
    previewText: `We have received your application for ${restaurantName}. It is currently under review.`,
    badge: "Application Status",
    headerTitle: "Application Under Review",
    headerSubtitle: `Thank you for onboarding ${restaurantName} with Marinate360.`,
    contentHtml,
    footerNotes: "Have questions? Our support team is ready to help at support@marinate360.com.",
  });

  const text = `
Application Received: ${restaurantName}

Hello ${ownerName || "Partner"},

We have received your onboarding application for ${restaurantName}.
Status: UNDER REVIEW

Our operations team will review your submission and email you login credentials as soon as your restaurant is activated.
  `.trim();

  return { subject, html, text };
}
