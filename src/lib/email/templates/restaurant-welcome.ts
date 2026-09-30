import { EMAIL_CONFIG } from "../client";
import { wrapInBaseEmailLayout } from "./base-layout";

export type RestaurantWelcomeEmailParams = {
  ownerName: string;
  email: string;
  restaurantName: string;
  domainUrl: string;
  posDomain?: string | null;
  packageName?: string;
  temporaryPassword?: string | null;
  mustChangePassword?: boolean;
};

export function renderRestaurantWelcomeEmail(params: RestaurantWelcomeEmailParams): { subject: string; html: string; text: string } {
  const {
    ownerName,
    email,
    restaurantName,
    domainUrl,
    posDomain,
    packageName = "Marinate Menu",
    temporaryPassword,
    mustChangePassword = Boolean(temporaryPassword),
  } = params;

  const subject = `🎉 Welcome to Marinate360 - ${restaurantName} is Ready!`;
  const websiteUrl = domainUrl.startsWith("http") ? domainUrl : `https://${domainUrl}`;
  const posUrl = posDomain ? (posDomain.startsWith("http") ? posDomain : `https://${posDomain}`) : null;

  const credentialsHtml = temporaryPassword
    ? `
      <!-- Credentials Card -->
      <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 14px; padding: 24px; margin: 28px 0; color: #ffffff;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <span style="background-color: #ea580c; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 6px;">
                Initial Login Credentials
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 500; width: 140px;">Dashboard URL:</td>
                  <td style="padding: 8px 0;">
                    <a href="${EMAIL_CONFIG.loginUrl}" style="color: #fb923c; font-size: 14px; font-weight: 600; text-decoration: underline;">
                      ${EMAIL_CONFIG.loginUrl}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Login Email:</td>
                  <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">
                    ${email}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Temporary Password:</td>
                  <td style="padding: 8px 0;">
                    <code style="background-color: #18181b; color: #f97316; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 8px; border: 1px solid #3f3f46; letter-spacing: 0.06em; display: inline-block;">
                      ${temporaryPassword}
                    </code>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Security Notice -->
      ${
        mustChangePassword
          ? `
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 10px; padding: 18px 20px; margin: 24px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td valign="top" style="padding-right: 12px; font-size: 20px; line-height: 1;">
              ⚠️
            </td>
            <td>
              <h4 style="margin: 0; color: #92400e; font-size: 14px; font-weight: 700;">
                Required Action: Change Password After Login
              </h4>
              <p style="margin: 6px 0 0 0; color: #78350f; font-size: 13px; line-height: 1.5;">
                This temporary password was automatically generated. For account security, sign in and immediately navigate to <strong>Account Settings &rarr; Change Password</strong> to set your personal secret password.
              </p>
            </td>
          </tr>
        </table>
      </div>
      `
          : ""
      }
    `
    : `
      <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; color: #0f172a; font-size: 14px; line-height: 1.5;">
          You can sign in using your existing Marinate360 credentials with email: <strong>${email}</strong>.
        </p>
      </div>
    `;

  const contentHtml = `
    <p style="margin: 0 0 18px 0; color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong style="color: #0f172a;">${ownerName || "Partner"}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
      Your restaurant <strong style="color: #0f172a;">${restaurantName}</strong> has been registered on the Marinate360 platform. Everything is set up and ready for you to access.
    </p>

    <!-- Restaurant Info Grid -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; margin: 24px 0;">
      <h3 style="margin: 0 0 14px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        Outlet Specifications
      </h3>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 140px;">Restaurant:</td>
          <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${restaurantName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Store Website:</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">
            <a href="${websiteUrl}" style="color: #ea580c; text-decoration: none;">${domainUrl} &rarr;</a>
          </td>
        </tr>
        ${
          posUrl
            ? `
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">POS Terminal:</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">
            <a href="${posUrl}" style="color: #ea580c; text-decoration: none;">${posDomain} &rarr;</a>
          </td>
        </tr>
        `
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Subscription:</td>
          <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${packageName}</td>
        </tr>
      </table>
    </div>

    ${credentialsHtml}

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${EMAIL_CONFIG.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35); text-align: center;">
        Sign In to Dashboard &rarr;
      </a>
    </div>

    <!-- Step by Step Instructions -->
    <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px;">
      <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        Quick Start Guide
      </h4>
      <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
        <li>Go to <a href="${EMAIL_CONFIG.loginUrl}" style="color: #ea580c; font-weight: 600;">${EMAIL_CONFIG.loginUrl}</a>.</li>
        <li>Log in using your registered email and temporary password.</li>
        <li>${temporaryPassword ? "Update your temporary password in Account Settings." : "Verify your restaurant profile details."}</li>
        <li>Set up your categories, menu items, and table QR codes.</li>
      </ol>
    </div>
  `;

  const html = wrapInBaseEmailLayout({
    previewText: `Your restaurant ${restaurantName} is ready. Login credentials and instructions inside.`,
    badge: "Welcome to Marinate360",
    headerTitle: `${restaurantName} is Ready!`,
    headerSubtitle: "Your restaurant account and digital tools are live.",
    contentHtml,
    footerNotes: "If you did not request this account, please alert our security team at security@marinate360.com.",
  });

  const text = `
Welcome to Marinate360!

Restaurant: ${restaurantName}
Website: ${domainUrl}
Login Portal: ${EMAIL_CONFIG.loginUrl}
Email: ${email}
${temporaryPassword ? `Temporary Password: ${temporaryPassword}\n\nIMPORTANT: Please sign in immediately and change your password in Account Settings.` : ""}

Sign in at: ${EMAIL_CONFIG.loginUrl}
`.trim();

  return { subject, html, text };
}
