export function cleanSubdomainInput(input: string): string {
  let cleaned = (input || "").trim().toLowerCase();
  // Strip protocol
  cleaned = cleaned.replace(/^https?:\/\//, "");
  // Strip marinate360.com or any trailing domain
  cleaned = cleaned.split(".")[0];
  // Keep only alphanumeric and hyphen
  cleaned = cleaned.replace(/[^a-z0-9-]/g, "");
  // Strip leading or trailing hyphens
  cleaned = cleaned.replace(/^-+|-+$/g, "");
  return cleaned;
}

export function cleanCustomDomainInput(input: string): string {
  let cleaned = (input || "").trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/\/+$/, "");
  cleaned = cleaned.replace(/[^a-z0-9.-]/g, "");
  return cleaned;
}

/**
 * Extracts the exact key for SaaS API storage (subdomain slug or custom domain).
 * e.g. "veduka.marinate360.com" -> "veduka"
 * e.g. "https://veduka.marinate360.com/" -> "veduka"
 * e.g. "veduka" -> "veduka"
 * e.g. "wildlife.com" -> "wildlife.com"
 */
export function extractTenantKey(domainOrSubdomainInput: string): string {
  if (!domainOrSubdomainInput) return "";
  let cleaned = domainOrSubdomainInput.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (cleaned.endsWith(".marinate360.com")) {
    cleaned = cleaned.replace(/\.marinate360\.com$/, "");
    return cleanSubdomainInput(cleaned);
  }
  if (!cleaned.includes(".")) {
    return cleanSubdomainInput(cleaned);
  }
  return cleanCustomDomainInput(cleaned);
}
