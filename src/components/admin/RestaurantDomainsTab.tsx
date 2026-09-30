"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  checkDomainAvailability,
  type DomainCheckResult,
} from "@/src/app/actions/saas-domains";
import {
  updateRestaurantDomains,
  type RestaurantRecord,
} from "@/src/app/actions/restaurants";

interface Props {
  restaurant: RestaurantRecord;
  accessToken: string;
  userRole?: string;
  onRestaurantUpdated: (updated: RestaurantRecord) => void;
}

export default function RestaurantDomainsTab({
  restaurant,
  accessToken,
  userRole = "super_admin",
  onRestaurantUpdated,
}: Props) {
  const isSuperAdmin = userRole === "super_admin";

  // Determine initial domain mode & values from restaurant
  const existingDomainUrl = (restaurant.domain_url || `${restaurant.domain_name}.marinate360.com`).trim();
  const isExistingCustom =
    existingDomainUrl.includes(".") &&
    !existingDomainUrl.endsWith(".marinate360.com");

  const initialSubdomain = isExistingCustom
    ? restaurant.domain_name || ""
    : existingDomainUrl.replace(/\.marinate360\.com$/, "").replace(/^https?:\/\//, "");

  const initialCustomDomain = isExistingCustom
    ? existingDomainUrl.replace(/^https?:\/\//, "")
    : "";

  const [posDomain, setPosDomain] = useState(
    restaurant.pos_domain || "pos.marinate360.com"
  );
  const [domainMode, setDomainMode] = useState<"subdomain" | "custom">(
    isExistingCustom ? "custom" : "subdomain"
  );
  const [subdomainInput, setSubdomainInput] = useState(initialSubdomain);
  const [customDomainInput, setCustomDomainInput] = useState(initialCustomDomain);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainCheckResult, setDomainCheckResult] = useState<DomainCheckResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Active targeted domain based on mode
  const currentTargetDomain =
    domainMode === "custom"
      ? customDomainInput.trim().toLowerCase()
      : subdomainInput.trim()
      ? `${subdomainInput.trim().toLowerCase()}.marinate360.com`
      : "";

  // Check if anything has been modified
  const isDomainChanged = currentTargetDomain !== existingDomainUrl;
  const isPosChanged = posDomain.trim() !== (restaurant.pos_domain || "pos.marinate360.com");
  const hasChanges = isDomainChanged || isPosChanged;

  // Live DNS / availability debounced check
  useEffect(() => {
    const isCustom = domainMode === "custom";
    const currentInput = isCustom ? customDomainInput : subdomainInput;

    if (!currentInput || currentInput.trim().length < (isCustom ? 4 : 2)) {
      setDomainCheckResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDomain(true);
      try {
        const res = await checkDomainAvailability(
          currentInput,
          restaurant.id,
          isCustom
        );
        setDomainCheckResult(res);
      } catch (err) {
        console.warn("Domain check error:", err);
      } finally {
        setIsCheckingDomain(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [subdomainInput, customDomainInput, domainMode, restaurant.id]);

  const handleSelectSuggestion = (sugg: string) => {
    setSubdomainInput(sugg);
  };

  const handleSaveDomains = async () => {
    if (!currentTargetDomain) {
      toast.error("Please enter a valid Food Ordering App domain.");
      return;
    }

    if (domainCheckResult && !domainCheckResult.available && !domainCheckResult.isCurrentDomain) {
      toast.error(domainCheckResult.reason || "The entered domain is not available. Please choose another.");
      return;
    }

    setIsSaving(true);
    try {
      const isCustom = domainMode === "custom";
      const result = await updateRestaurantDomains(accessToken, restaurant.id, {
        domain_url: currentTargetDomain,
        pos_domain: posDomain.trim(),
        isCustomDomain: isCustom,
      });

      if (!result.ok) {
        toast.error(result.error || "Failed to update domain routing.");
        return;
      }

      toast.success(
        isDomainChanged
          ? "Domains updated! SaaS API edge routing updated successfully."
          : "Domain settings saved successfully!"
      );

      onRestaurantUpdated(result.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update domains.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Info */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-orange-100 text-orange-700 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
              Infrastructure & Routing
            </span>
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Platform & Domains</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure live POS terminal and Food Ordering App URLs. Custom domain mappings can be managed directly.
          </p>
        </div>

        {/* Live preview link if assigned */}
        {existingDomainUrl && (
          <a
            href={`https://${existingDomainUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
          >
            <Globe size={14} className="text-orange-500" />
            <span>Visit Live App</span>
            <ExternalLink size={12} className="text-zinc-400" />
          </a>
        )}
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* 1. POS Domain */}
        <div className="bg-zinc-50/80 rounded-xl p-5 border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-zinc-800">
              POS Terminal Domain <span className="text-red-500">*</span>
            </label>
            {!isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-600 bg-white border border-zinc-200 px-2.5 py-0.5 rounded-md font-semibold">
                <Lock className="w-3 h-3 text-zinc-400" />
                Platform Managed (Read Only)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md font-semibold">
                Configurable Endpoint
              </span>
            )}
          </div>
          <input
            type="text"
            disabled={!isSuperAdmin}
            value={posDomain}
            onChange={(e) => setPosDomain(e.target.value)}
            placeholder="pos.marinate360.com"
            className={`w-full px-4 py-3 border rounded-lg text-sm transition-all ${
              !isSuperAdmin
                ? "bg-zinc-100 text-zinc-600 border-zinc-300 cursor-not-allowed font-medium select-none"
                : "bg-white text-zinc-900 border-zinc-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
            }`}
          />
          <p className="text-xs text-zinc-500 mt-1.5">
            Operational POS terminal URL for order processing, billing, and kitchen display.
          </p>
        </div>

        {/* 2. Food Ordering App URL (Hostinger Style Domain Checker) */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-zinc-800">
                Food Ordering App URL (Subdomain) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-zinc-500 mt-0.5">
                Search and claim your live web ordering domain. Automatic DNS edge routing will be updated upon saving.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Live DNS Verification
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-lg w-fit border border-zinc-200">
            <button
              type="button"
              disabled={!isSuperAdmin}
              onClick={() => {
                if (!isSuperAdmin) return;
                setDomainMode("subdomain");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                domainMode === "subdomain"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              } ${!isSuperAdmin ? "cursor-not-allowed" : ""}`}
            >
              Standard Subdomain (.marinate360.com)
            </button>
            <button
              type="button"
              disabled={!isSuperAdmin}
              onClick={() => {
                if (!isSuperAdmin) return;
                setDomainMode("custom");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                domainMode === "custom"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              } ${!isSuperAdmin ? "cursor-not-allowed" : ""}`}
            >
              Custom Domain (e.g. wildlife.com)
            </button>
          </div>

          {/* Search Input Group */}
          <div>
            {domainMode === "subdomain" ? (
              <div className={`flex rounded-xl shadow-2xs border ${
                !isSuperAdmin ? "bg-zinc-100/70 border-zinc-200" : "bg-white border-zinc-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
              } overflow-hidden transition-all`}>
                <span className="inline-flex items-center px-3.5 bg-zinc-50 border-r border-zinc-200 text-xs font-semibold text-zinc-500 select-none">
                  https://
                </span>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={subdomainInput}
                  onChange={(e) => {
                    if (!isSuperAdmin) return;
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setSubdomainInput(val);
                  }}
                  placeholder="your-restaurant-name"
                  className={`flex-1 px-3.5 py-3 text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none ${
                    !isSuperAdmin ? "cursor-not-allowed bg-zinc-100/70 select-none" : ""
                  }`}
                />
                <span className="inline-flex items-center px-3.5 bg-zinc-50 border-l border-zinc-200 text-xs font-semibold text-zinc-600 select-none">
                  .marinate360.com
                </span>
                <div className={`flex items-center pr-3 pl-2 ${!isSuperAdmin ? "bg-zinc-100/70" : "bg-white"}`}>
                  {isCheckingDomain ? (
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                  ) : domainCheckResult?.isCurrentDomain ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : domainCheckResult?.available ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : domainCheckResult && !domainCheckResult.available ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className={`flex rounded-xl shadow-2xs border ${
                  !isSuperAdmin ? "bg-zinc-100/70 border-zinc-200" : "bg-white border-zinc-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
                } overflow-hidden transition-all`}>
                  <span className="inline-flex items-center px-3.5 bg-zinc-50 border-r border-zinc-200 text-xs font-semibold text-zinc-500 select-none">
                    https://
                  </span>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={customDomainInput}
                    onChange={(e) => {
                      if (!isSuperAdmin) return;
                      const val = e.target.value.toLowerCase().trim().replace(/[^a-z0-9.-]/g, "");
                      setCustomDomainInput(val);
                    }}
                    placeholder="e.g. wildlife.com or order.restaurant.com"
                    className={`flex-1 px-3.5 py-3 text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none ${
                      !isSuperAdmin ? "cursor-not-allowed bg-zinc-100/70 select-none" : ""
                    }`}
                  />
                  <div className={`flex items-center pr-3 pl-2 ${!isSuperAdmin ? "bg-zinc-100/70" : "bg-white"}`}>
                    {isCheckingDomain ? (
                      <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                    ) : domainCheckResult?.isCurrentDomain ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : domainCheckResult?.available ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : domainCheckResult && !domainCheckResult.available ? (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  Configure your custom brand domain. To point your live traffic, add a CNAME record pointing to{" "}
                  <span className="font-mono text-zinc-700 font-semibold">origin-1.marinate360.com</span>.
                </p>
              </div>
            )}
          </div>

          {/* Status Feedback Banner */}
          {isCheckingDomain && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200/80 rounded-xl px-4 py-2.5 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
              <span>Checking domain availability across database & edge DNS servers...</span>
            </div>
          )}

          {!isCheckingDomain && domainCheckResult?.isCurrentDomain && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    {domainCheckResult.fullDomain} is currently assigned & active!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    This domain is active and routed on Marinate360 SaaS edge proxy for this restaurant.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg shrink-0">
                Current Domain
              </span>
            </div>
          )}

          {!isCheckingDomain && !domainCheckResult?.isCurrentDomain && domainCheckResult?.available && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    {domainCheckResult.fullDomain} is available!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Domain is verified and ready for instant automatic routing upon saving.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg shadow-2xs shrink-0">
                Available
              </span>
            </div>
          )}

          {!isCheckingDomain && !domainCheckResult?.isCurrentDomain && domainCheckResult && !domainCheckResult.available && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 text-rose-900 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    {domainCheckResult.fullDomain} is not available
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {domainCheckResult.reason || "This domain is already registered to another restaurant or reserved."}
                  </p>
                </div>
              </div>

              {isSuperAdmin && domainCheckResult.suggestions && domainCheckResult.suggestions.length > 0 && (
                <div className="pt-2 border-t border-rose-200/70">
                  <p className="text-xs font-semibold text-rose-800 mb-2">
                    Available alternatives:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {domainCheckResult.suggestions.map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => handleSelectSuggestion(sugg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-orange-50 border border-rose-200 hover:border-orange-300 text-xs font-semibold text-zinc-800 rounded-lg transition-colors shadow-2xs group"
                      >
                        <span>{sugg}.marinate360.com</span>
                        <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">+ Claim</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Diff Banner & Save Action */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              {isDomainChanged ? "Domain Routing Update Pending" : "Current Routing Status"}
            </div>
            {isDomainChanged ? (
              <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium flex-wrap">
                <span className="font-mono text-zinc-500 line-through">{existingDomainUrl}</span>
                <ArrowRight size={13} className="text-orange-500 shrink-0" />
                <span className="font-mono font-bold text-zinc-900 bg-orange-100 px-2 py-0.5 rounded text-orange-800">
                  {currentTargetDomain}
                </span>
                <span className="text-[11px] text-zinc-500">
                  (Old domain will be deleted and new domain registered in SaaS API)
                </span>
              </div>
            ) : (
              <div className="text-xs text-zinc-500">
                Routed to: <span className="font-mono font-semibold text-zinc-800">{existingDomainUrl}</span>
              </div>
            )}
          </div>

          {!isSuperAdmin ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-600 shadow-2xs select-none">
              <Lock size={14} className="text-zinc-400" />
              <span>Platform Managed (Read Only)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSaveDomains}
              disabled={isSaving || Boolean(domainCheckResult && !domainCheckResult.available && !domainCheckResult.isCurrentDomain)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Edge Routing...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Domains</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
