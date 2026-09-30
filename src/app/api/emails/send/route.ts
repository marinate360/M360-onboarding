import { NextResponse } from "next/server";
import {
  sendRestaurantWelcomeEmail,
  sendAdminNewApplicationAlert,
  sendCustomerApplicationSubmittedConfirmation,
} from "@/src/lib/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { ok: false, error: "Missing required 'type' and 'data' fields." },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "restaurant_welcome":
        result = await sendRestaurantWelcomeEmail({
          ownerName: data.ownerName,
          email: data.email,
          restaurantName: data.restaurantName,
          domainUrl: data.domainUrl,
          posDomain: data.posDomain,
          packageName: data.packageName,
          temporaryPassword: data.temporaryPassword,
          mustChangePassword: data.mustChangePassword,
        });
        break;

      case "admin_application_alert":
        result = await sendAdminNewApplicationAlert({
          applicationId: data.applicationId || "manual",
          restaurantName: data.restaurantName,
          ownerName: data.ownerName,
          email: data.email,
          phone: data.phone,
          packageName: data.packageName,
          cuisines: data.cuisines,
          city: data.city,
        });
        break;

      case "customer_application_confirmation":
        result = await sendCustomerApplicationSubmittedConfirmation(data.email, {
          restaurantName: data.restaurantName,
          ownerName: data.ownerName,
          packageName: data.packageName,
        });
        break;

      default:
        return NextResponse.json(
          { ok: false, error: `Unsupported email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("[API Emails] Error processing request:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
