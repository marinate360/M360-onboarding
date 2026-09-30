export const EMAIL_THEME = {
  primary: "#ea580c", // Vibrant orange
  primaryLight: "#ffedd5",
  primaryDark: "#c2410c",
  background: "#f8fafc",
  cardBg: "#ffffff",
  textDark: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  codeBg: "#0f172a",
  fontStack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export type BaseLayoutOptions = {
  previewText?: string;
  badge?: string;
  badgeColor?: string;
  headerTitle: string;
  headerSubtitle?: string;
  contentHtml: string;
  footerNotes?: string;
};

/**
 * Enterprise-grade HTML Email Wrapper compatible with Gmail, Apple Mail, Outlook, and mobile clients.
 */
export function wrapInBaseEmailLayout(options: BaseLayoutOptions): string {
  const {
    previewText,
    badge = "Marinate360",
    headerTitle,
    headerSubtitle,
    contentHtml,
    footerNotes,
  } = options;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${headerTitle}</title>
  ${
    previewText
      ? `
  <!-- Hidden preheader text to show in inbox snippet -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    ${previewText}
    ${"&nbsp;&zwnj;".repeat(30)}
  </div>
  `
      : ""
  }
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: ${EMAIL_THEME.fontStack}; }
    .email-container { max-width: 600px; margin: 0 auto; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .content-cell { padding: 24px 20px !important; }
      .header-cell { padding: 28px 20px !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%); height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td class="header-cell" style="padding: 36px 36px 28px 36px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Logo / Brand Title -->
                    <div style="display: inline-block; padding: 4px 10px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 6px; margin-bottom: 16px;">
                      <span style="color: #ea580c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                        ${badge}
                      </span>
                    </div>
                    <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; line-height: 1.25; letter-spacing: -0.02em;">
                      ${headerTitle}
                    </h1>
                    ${
                      headerSubtitle
                        ? `<p style="margin: 8px 0 0 0; color: #64748b; font-size: 15px; line-height: 1.5;">${headerSubtitle}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-cell" style="padding: 32px 36px; background-color: #ffffff;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 28px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              ${
                footerNotes
                  ? `<p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.5;">${footerNotes}</p>`
                  : ""
              }
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                This is an automated operational notification from <strong>Marinate360</strong>.<br />
                Questions? Email us at <a href="mailto:support@marinate360.com" style="color: #ea580c; text-decoration: none;">support@marinate360.com</a>
              </p>
              <p style="margin: 12px 0 0 0; color: #cbd5e1; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Marinate360 Platforms Pvt Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
