import { sendEmail, EMAIL_CONFIG } from "./client";
import {
  renderRestaurantWelcomeEmail,
  type RestaurantWelcomeEmailParams,
} from "./templates/restaurant-welcome";
import {
  renderAdminNewApplicationEmail,
  type AdminNewApplicationEmailParams,
} from "./templates/admin-new-application";
import {
  renderCustomerApplicationSubmittedEmail,
  type CustomerApplicationSubmittedEmailParams,
} from "./templates/customer-application-submitted";

/**
 * Sends a welcome email to the restaurant owner when a restaurant is created or approved.
 * Includes website domain, POS URL, and generated temporary login credentials (if generated).
 */
export async function sendRestaurantWelcomeEmail(params: RestaurantWelcomeEmailParams) {
  if (!params.email) {
    console.warn("[EmailService] No email provided for restaurant welcome email.");
    return { success: false, error: "No recipient email provided" };
  }

  const { subject, html, text } = renderRestaurantWelcomeEmail(params);
  return sendEmail({
    to: params.email,
    subject,
    html,
    text,
  });
}

/**
 * Notifies the company/owner (nexodigitalsolutions@gmail.com) that a customer submitted a new onboarding application.
 */
export async function sendAdminNewApplicationAlert(params: AdminNewApplicationEmailParams) {
  const recipient = EMAIL_CONFIG.adminRecipient;
  const { subject, html, text } = renderAdminNewApplicationEmail(params);
  return sendEmail({
    to: recipient,
    subject,
    html,
    text,
  });
}

/**
 * Sends confirmation to the customer that their onboarding application was received and is under review.
 */
export async function sendCustomerApplicationSubmittedConfirmation(
  toEmail: string,
  params: CustomerApplicationSubmittedEmailParams
) {
  if (!toEmail) return { success: false, error: "No recipient email provided" };

  const { subject, html, text } = renderCustomerApplicationSubmittedEmail(params);
  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * Helper to dispatch both admin alert and customer confirmation concurrently when an onboarding application is submitted.
 */
export async function handleOnboardingApplicationEmails(data: {
  applicationId: string;
  restaurantName: string;
  ownerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  packageName?: string;
  cuisines?: string[];
  city?: string;
}) {
  const [adminResult, customerResult] = await Promise.allSettled([
    sendAdminNewApplicationAlert({
      applicationId: data.applicationId,
      restaurantName: data.restaurantName,
      ownerName: data.ownerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      packageName: data.packageName,
      cuisines: data.cuisines,
      city: data.city,
    }),
    sendCustomerApplicationSubmittedConfirmation(data.customerEmail, {
      restaurantName: data.restaurantName,
      ownerName: data.ownerName,
      packageName: data.packageName,
    }),
  ]);

  return {
    adminAlert: adminResult.status === "fulfilled" ? adminResult.value : null,
    customerConfirmation: customerResult.status === "fulfilled" ? customerResult.value : null,
  };
}
