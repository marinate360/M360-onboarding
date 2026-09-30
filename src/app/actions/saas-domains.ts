"use server";

import { getSupabaseAdmin } from "@/src/app/actions/supabase/server";

export interface DomainCheckResult {
  ok: boolean;
  available: boolean;
  subdomain: string;
  fullDomain: string;
  isCustomDomain?: boolean;
  isCurrentDomain?: boolean;
  reason?: string;
  suggestions?: string[];
  error?: string;
}

export interface SaasTenant {
  key: string;
  value: {
    subdomain: string;
    cluster: string;
    status: "active" | "inactive" | string;
  };
}

export interface SaasTenantListResult {
  ok: boolean;
  tenants: SaasTenant[];
  list_complete?: boolean;
  cursor?: string;
  error?: string;
}

function getSaasConfig() {
  const baseUrl = (process.env.Base_URL || process.env.SAAS_API_BASE_URL || "https://saas-api.marinate360.com").replace(/\/+$/, "");
  const token = (process.env.SAAS_API_TOKEN || process.env.ADMIN_TOKEN || "").trim();
  return { baseUrl, token };
}

import {
  cleanSubdomainInput,
  cleanCustomDomainInput,
  extractTenantKey,
} from "@/src/lib/utils/domain";

/**
 * Check if a domain (subdomain or custom domain) is already in use in Supabase database
 */
async function checkSupabaseDomain(
  domainOrSubdomain: string,
  excludeRestaurantId?: string,
  isCustomDomain: boolean = false
): Promise<{ taken: boolean; isOwnDomain?: boolean; reason?: string }> {
  const admin = getSupabaseAdmin();

  // If excludeRestaurantId is provided, check if this is the restaurant's own current domain
  if (excludeRestaurantId) {
    const { data: ownRest } = await admin
      .from("restaurants")
      .select("id, domain_name, domain_url")
      .eq("id", excludeRestaurantId)
      .maybeSingle();

    if (ownRest) {
      const ownKey = extractTenantKey(ownRest.domain_url || ownRest.domain_name);
      const targetKey = extractTenantKey(domainOrSubdomain);
      if (ownKey && targetKey && ownKey === targetKey) {
        return { taken: false, isOwnDomain: true };
      }
    }
  }

  // 1. Check restaurants table
  let restQuery = admin.from("restaurants").select("id, restaurant_name, domain_name, domain_url");

  if (isCustomDomain) {
    restQuery = restQuery.or(`domain_name.eq.${domainOrSubdomain},domain_url.ilike.%${domainOrSubdomain}%`);
  } else {
    restQuery = restQuery.or(`domain_name.eq.${domainOrSubdomain},domain_url.ilike.%${domainOrSubdomain}.marinate360.com%`);
  }

  if (excludeRestaurantId) {
    restQuery = restQuery.neq("id", excludeRestaurantId);
  }

  const { data: existingRest } = await restQuery.maybeSingle();
  if (existingRest) {
    return {
      taken: true,
      reason: `Already registered to restaurant "${existingRest.restaurant_name}".`,
    };
  }

  // 2. Check onboarding_applications table
  const { data: existingApp } = await admin
    .from("onboarding_applications")
    .select("id, restaurant_name, domain_name, status")
    .eq("domain_name", domainOrSubdomain)
    .neq("status", "rejected")
    .maybeSingle();

  if (existingApp) {
    return {
      taken: true,
      reason: `Reserved by pending onboarding application ("${existingApp.restaurant_name}").`,
    };
  }

  return { taken: false };
}

/**
 * Check if a domain exists in SaaS API gateway (https://saas-api.marinate360.com)
 */
async function checkSaasApiDomain(key: string): Promise<{ taken: boolean; reason?: string }> {
  const { baseUrl, token } = getSaasConfig();

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}/api/tenants/${encodeURIComponent(key)}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.status === 200) {
      const data = await res.json().catch(() => null);
      if (data && (data.key || data.value)) {
        return {
          taken: true,
          reason: `Configured on Marinate360 SaaS edge proxy (${data.value?.cluster || "active"}).`,
        };
      }
    }
  } catch (err: unknown) {
    // If SaaS API is unreachable, log warning and let Supabase check proceed
    console.warn(`[SaaS API] Availability check error for "${key}":`, err);
  }

  return { taken: false };
}

/**
 * Hostinger-style Domain Availability Checker
 * Validates against both Supabase Database and SaaS Edge Routing Proxy.
 * Supports both standard subdomains (.marinate360.com) and custom domains (e.g. wildlife.com).
 */
export async function checkDomainAvailability(
  domainInput: string,
  excludeRestaurantId?: string,
  isCustomDomain: boolean = false
): Promise<DomainCheckResult> {
  if (isCustomDomain) {
    const customDomain = cleanCustomDomainInput(domainInput);

    if (!customDomain || !/^[a-z0-9][a-z0-9-]*\.[a-z0-9.-]+$/i.test(customDomain)) {
      return {
        ok: false,
        available: false,
        subdomain: customDomain,
        fullDomain: customDomain,
        isCustomDomain: true,
        reason: "Please enter a valid domain name (e.g. wildlife.com or order.wildlife.com).",
      };
    }

    const dbResult = await checkSupabaseDomain(customDomain, excludeRestaurantId, true);
    if (dbResult.isOwnDomain) {
      return {
        ok: true,
        available: true,
        subdomain: customDomain,
        fullDomain: customDomain,
        isCustomDomain: true,
        isCurrentDomain: true,
      };
    }

    const saasResult = await checkSaasApiDomain(customDomain);
    const isTaken = dbResult.taken || saasResult.taken;
    const reason = dbResult.reason || saasResult.reason;

    return {
      ok: true,
      available: !isTaken,
      subdomain: customDomain,
      fullDomain: customDomain,
      isCustomDomain: true,
      reason: isTaken ? reason : undefined,
    };
  }

  // Standard Subdomain mode (.marinate360.com)
  const subdomain = cleanSubdomainInput(domainInput);

  if (!subdomain || subdomain.length < 3) {
    return {
      ok: false,
      available: false,
      subdomain,
      fullDomain: subdomain ? `${subdomain}.marinate360.com` : "",
      isCustomDomain: false,
      reason: "Domain must be at least 3 characters long.",
    };
  }

  const dbResult = await checkSupabaseDomain(subdomain, excludeRestaurantId, false);
  if (dbResult.isOwnDomain) {
    return {
      ok: true,
      available: true,
      subdomain,
      fullDomain: `${subdomain}.marinate360.com`,
      isCustomDomain: false,
      isCurrentDomain: true,
    };
  }

  const saasResult = await checkSaasApiDomain(subdomain);
  const isTaken = dbResult.taken || saasResult.taken;
  const reason = dbResult.reason || saasResult.reason;

  let suggestions: string[] = [];
  if (isTaken) {
    // Generate 3 available candidate suggestions
    const candidates = [
      `${subdomain}-1`,
      `${subdomain}-2`,
      `${subdomain}-pos`,
      `${subdomain}-hub`,
      `${subdomain}-order`,
    ];

    for (const cand of candidates) {
      const candDb = await checkSupabaseDomain(cand, excludeRestaurantId, false);
      if (!candDb.taken) {
        suggestions.push(cand);
        if (suggestions.length >= 3) break;
      }
    }
  }

  return {
    ok: true,
    available: !isTaken,
    subdomain,
    fullDomain: `${subdomain}.marinate360.com`,
    isCustomDomain: false,
    reason: isTaken ? reason : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

/**
 * Add or update tenant in SaaS edge router
 */
export async function createSaasTenant(
  domainOrSubdomainInput: string,
  cluster: string = "origin-1.marinate360.com",
  status: "active" | "inactive" = "active"
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const key = extractTenantKey(domainOrSubdomainInput);

  if (!key) {
    return { ok: false, error: "Invalid domain or subdomain." };
  }

  const { baseUrl, token } = getSaasConfig();

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      key,
      value: {
        subdomain: key,
        cluster,
        status,
      },
    };

    const res = await fetch(`${baseUrl}/api/tenants`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      console.warn(`[SaaS API] Registration returned ${res.status}:`, errText);
      return { ok: false, error: `SaaS API error (${res.status}): ${errText}` };
    }

    const data = await res.json().catch(() => ({ success: true }));
    return { ok: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error contacting SaaS API";
    return { ok: false, error: msg };
  }
}

/**
 * Retrieve paginated list of all tenants from SaaS API
 */
export async function getSaasTenants(
  limit: number = 100,
  cursor?: string
): Promise<SaasTenantListResult> {
  const { baseUrl, token } = getSaasConfig();

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${baseUrl}/api/tenants?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      return { ok: false, tenants: [], error: `Failed to fetch tenants (${res.status}): ${errText}` };
    }

    const data = await res.json().catch(() => ({ tenants: [], list_complete: true }));
    return {
      ok: true,
      tenants: Array.isArray(data.tenants) ? data.tenants : [],
      list_complete: data.list_complete ?? true,
      cursor: data.cursor,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, tenants: [], error: msg };
  }
}

/**
 * Delete a tenant from SaaS edge router
 */
export async function deleteSaasTenant(
  domainOrSubdomainInput: string
): Promise<{ ok: boolean; error?: string }> {
  const key = extractTenantKey(domainOrSubdomainInput);

  if (!key) {
    return { ok: false, error: "Invalid domain or subdomain." };
  }

  const { baseUrl, token } = getSaasConfig();

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}/api/tenants/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!res.ok && res.status !== 404) {
      const errText = await res.text().catch(() => "Unknown error");
      return { ok: false, error: `Failed to delete tenant (${res.status}): ${errText}` };
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: msg };
  }
}
