"use client";

import type { InlineProduct } from "@/types/sourcing";
import { Box, Check, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

interface ThinkingStep {
  step: string;
  status: "running" | "completed";
  content: string;
  durationMs?: number;
  terms?: string[];  // baseLlmTerms: one capsule per user-intent term
  term?: string;     // per-pipeline term (searching_kapruka, validating_relevance)
  _key?: string;     // internal dedup key (step__term)
  logs?: string[];   // real-time MCP tool logs
}

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  activeToolCall?: { name: string; args: unknown } | null;
  activeToolCalls?: Array<{ name: string; args: unknown }>;
  isGenerating: boolean;
  hasText: boolean;
  inlineProducts?: InlineProduct[];
  productGroups?: Array<{ title: string; products: InlineProduct[] }>;
  activeQueryText?: string;
  onViewDetails?: (products: InlineProduct[], queryHint?: string) => void;
}

// Maps step keys to B2B capsule badge titles
function getStepBadge(stepKey: string): string {
  const badgeMap: Record<string, string> = {
    searching_kapruka:   "Product search",
    validating_relevance: "Relevance check",
    sme_filter:          "SME filtering",
    checking_delivery:   "Delivery check",
    tracking_order:      "Order tracking",
    calculating_import:  "Import calculator",
    finding_providers:   "Service search",
    google_search_query: "Google Search",
  };
  return badgeMap[stepKey] || "Product search";
}

// Maps tool call names to B2B capsule badge titles
function getToolBadge(toolName: string): string {
  const toolMap: Record<string, string> = {
    kapruka_search_products: "Product search",
    kapruka_search_products_sme: "SME filtering",
    kapruka_check_delivery: "Delivery check",
    kapruka_track_order: "Order tracking",
    kapruka_import_estimate: "Import calculator",
    kapruka_service_search: "Service search",
    google_search: "Google Search",
  };
  return toolMap[toolName] || "Product search";
}

// Extracts quote strings or keywords array from content text
function extractQueryFromContent(content: string, fallback: string): string {
  const match = content.match(/"([^"]+)"/);
  if (match && match[1]) {
    return match[1];
  }
  const bracketMatch = content.match(/Keywords:\s*\[([^\]]+)\]/);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }
  return fallback;
}

// Helper to extract clean query string or value from tool call arguments
function getToolCallQuery(toolName: string, args: unknown): string | null {
  if (!args || typeof args !== "object") return null;
  const params = (args as Record<string, unknown>).params || args;
  const obj = params as Record<string, unknown>;
  
  if (toolName === "kapruka_search_products" || toolName === "kapruka_search_products_sme") {
    return (obj.query || obj.q || null) as string | null;
  }
  if (toolName === "kapruka_check_delivery" || toolName === "kapruka_list_delivery_cities" || toolName === "kapruka_service_search") {
    return (obj.city || obj.query || null) as string | null;
  }
  if (toolName === "kapruka_track_order") {
    return (obj.order_id || obj.order_number || null) as string | null;
  }
  if (toolName === "kapruka_import_estimate") {
    return (obj.url || null) as string | null;
  }
  return null;
}

export default function ThinkingPanel({
  steps,
  activeToolCall,
  activeToolCalls,
  isGenerating,
  inlineProducts = [],
  productGroups = [],
  activeQueryText = "",
  onViewDetails,
}: ThinkingPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auto-expand when generating
  const showContent = isGenerating || !isCollapsed;

  // Filter out duplicate log items
  const visibleSteps = steps.filter(s => s.content && s.step !== "generating_response");

  // Determine explanation summary description text
  const primaryStep = visibleSteps[0];
  const summaryDescription = primaryStep
    ? primaryStep.content
    : `Searching for items related to "${activeQueryText}", including suitable matches, to provide options.`;

  // Collect products to pass when clicking "View details"
  const allProducts = inlineProducts.length > 0
    ? inlineProducts
    : productGroups.flatMap(g => g.products);

  return (
    <div className="w-full select-none pb-2 transition-all duration-300">
      {/* ── 1. Header State & Top Divider Line ── */}
      {isGenerating ? (
        <div className="w-full mb-3">
          <div className="flex items-center gap-2.5 text-slate-500 text-[13px] font-medium py-1 select-none">
            {/* Spinning Dot Loader */}
            <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
              <Loader2 size={15} className="text-[#402970] animate-spin" />
            </div>
            <span>Working on your task</span>
          </div>

          {/* Underline Divider with Animated Brand Gradient */}
          <div className="w-full h-[1px] bg-slate-100 relative overflow-hidden mt-2">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#402970] to-purple-400 rounded-full animate-progress-slide"
              style={{ width: "35%" }}
            />
          </div>
        </div>
      ) : (
        /* Completed Collapsible Header */
        <div className="w-full mb-2">
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 transition-colors duration-200 select-none"
          >
            <span>Show thought process</span>
            <ChevronDown
              size={13}
              className={`text-slate-500 transition-transform duration-300 ease-in-out shrink-0 ${
                showContent ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
          <div className="w-full h-[1px] bg-slate-100 mt-1" />
        </div>
      )}

      {/* ── 2. Expandable Content Panel ── */}
      <div
        className={`grid ${
          showContent
            ? "grid-rows-[1fr] opacity-100 pointer-events-auto mt-3"
            : "grid-rows-[0fr] opacity-0 pointer-events-none mt-0"
        }`}
        style={{
          transitionProperty: "grid-template-rows, opacity, margin-top",
          transitionDuration: "300ms",
          transitionTimingFunction: "ease-in-out",
        }}
      >
        <div className="overflow-hidden space-y-3 pb-1">
          {/* Status Bullet Title */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#402970] shrink-0" />
            <span className="text-[14px] font-bold text-slate-800 tracking-tight">
              Getting everything ready
            </span>
          </div>

          {/* Connector Line & Inner Steps */}
          <div className="border-l border-slate-100/90 ml-1.2 pl-5 space-y-3">
            {/* Description Summary Text */}
            <p className="text-slate-600 text-[13px] font-medium leading-relaxed pr-2">
              {summaryDescription}
            </p>

            {/* Render Capsule Rows for Steps */}
            {visibleSteps.map((step, idx) => {
              const badge = getStepBadge(step.step);
              const query = extractQueryFromContent(step.content, activeQueryText);
              const isSearchStep = step.step === "searching_kapruka";
              const terms = (isSearchStep && step.terms && step.terms.length > 0)
                ? step.terms
                : [query];

              return (
                <div key={step._key || `${step.step}_${idx}`} className="space-y-2 animate-step-enter">
                  {/* Terminal Log View for this step */}
                  {step.logs && step.logs.length > 0 && (
                    <div className="mb-2 bg-[#1e1e2e] border border-slate-700/50 rounded-xl p-2.5 text-[11px] font-mono text-emerald-400 max-h-[140px] overflow-y-auto shadow-inner flex flex-col gap-1 w-full max-w-2xl">
                      {step.logs.map((log, i) => (
                        <div key={i} className="leading-snug break-words">
                          <span className="text-slate-500 mr-2">›</span>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render capsule rows matching attached screenshot */}
                  <div className="flex flex-col gap-2 max-w-3xl">
                    {terms.map((termItem) => (
                      <div
                        key={termItem}
                        className="bg-slate-100/70 hover:bg-slate-100/90 border border-slate-200/40 rounded-2xl md:rounded-full px-3.5 py-2 flex items-center justify-between gap-3 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Inner White Badge */}
                          <div className="bg-white border border-slate-200/80 rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-800 shadow-2xs shrink-0 select-none relative overflow-hidden">
                            <Box size={13} className="text-[#402970] shrink-0" />
                            <span>{badge}</span>
                            {step.status === "running" && (
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#402970] animate-pulse" />
                            )}
                          </div>

                          {/* Query Term Text */}
                          <span className="font-bold text-slate-800 text-[12px] truncate max-w-[200px] sm:max-w-[380px]">
                            {termItem}
                          </span>
                        </div>

                        {/* Right "View details" Action Link */}
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(allProducts, termItem)}
                            className="text-[11px] font-bold text-slate-700 hover:text-[#402970] underline underline-offset-2 cursor-pointer shrink-0 transition-colors"
                          >
                            View details
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Render Active Parallel/Single Running Tool Calls */}
            {isGenerating && (() => {
              const callsToShow: Array<{ name: string; args: unknown }> = [];
              if (activeToolCalls && activeToolCalls.length > 0) {
                activeToolCalls.forEach(c => {
                  if (!callsToShow.some(x => x.name === c.name && (x.args as Record<string, unknown>)?.query === (c.args as Record<string, unknown>)?.query)) {
                    callsToShow.push(c);
                  }
                });
              } else if (activeToolCall) {
                callsToShow.push(activeToolCall);
              }

              const completedBadges = visibleSteps.map(s => getStepBadge(s.step));
              const filteredCalls = callsToShow.filter(c => !completedBadges.includes(getToolBadge(c.name)));

              if (filteredCalls.length === 0) return null;

              return (
                <div className="flex flex-col gap-2 max-w-3xl pt-1">
                  {filteredCalls.map((call, idx) => {
                    const badge = getToolBadge(call.name);
                    const toolQuery = getToolCallQuery(call.name, call.args) || activeQueryText;

                    return (
                      <div
                        key={`${call.name}_${idx}`}
                        className="bg-slate-100/70 hover:bg-slate-100/90 border border-slate-200/40 rounded-2xl md:rounded-full px-3.5 py-2 flex items-center justify-between gap-3 transition-all duration-200 animate-fadeIn"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Inner White Badge with active indicator */}
                          <div className="bg-white border border-slate-200/80 rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-800 shadow-2xs shrink-0 select-none relative overflow-hidden">
                            <Box size={13} className="text-[#402970] shrink-0 animate-pulse" />
                            <span>{badge}</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#402970] animate-pulse" />
                          </div>

                          {/* Query Term Text */}
                          <span className="font-bold text-slate-800 text-[12px] truncate max-w-[200px] sm:max-w-[380px]">
                            {toolQuery}
                          </span>
                        </div>

                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(allProducts, toolQuery)}
                            className="text-[11px] font-bold text-slate-700 hover:text-[#402970] underline underline-offset-2 cursor-pointer shrink-0 transition-colors"
                          >
                            View details
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Shimmer Skeleton Loading Bars (matches attached reference screenshot) */}
            {isGenerating && (
              <div className="space-y-2.5 pt-2 animate-pulse pr-4">
                <div className="h-3.5 bg-slate-100/90 rounded-full w-[45%]" />
                <div className="h-3.5 bg-slate-100/90 rounded-full w-[90%]" />
                <div className="h-3.5 bg-slate-100/90 rounded-full w-[75%]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
