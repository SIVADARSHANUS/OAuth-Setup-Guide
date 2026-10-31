import { base44 } from "@/api/base44Client";
import { parseGeneratedGuide } from "@/lib/guideSchema";
import { saveGeneratedGuide } from "@/lib/generatedGuides";
import { findCuratedBySlug } from "@/lib/guides";

/**
 * Staged research pipeline. Each pass is a separate request so the interface can
 * report progress honestly: identity, then the setup documentation, then the
 * provider's review policy. The final pass composes and validates the guide.
 */
export const GENERATION_STAGES = [
  {
    key: "identify",
    label: "Identify the app",
    detail: "Matches the name to the provider's official developer documentation",
  },
  {
    key: "requirements",
    label: "Read the setup documentation",
    detail: "Build a provider-specific checklist from every relevant setup and API document",
  },
  {
    key: "review",
    label: "Check review requirements",
    detail: "Whether approval is needed before real users can connect",
  },
  {
    key: "compose",
    label: "Compose the guide",
    detail: "Validates findings and labels the evidence behind every claim",
  },
];

const IDENTITY_SCHEMA = {
  type: "object",
  properties: {
    app_name: { type: "string" },
    domain: { type: "string" },
    docs_root_url: { type: "string" },
    oauth_docs_url: { type: "string" },
    monogram: { type: "string" },
    tagline: { type: "string" },
    supports_custom_oauth_app: { type: "boolean" },
    path_hint: {
      type: "string",
      enum: ["custom_oauth_app", "managed_oauth", "api_key", "mixed"],
    },
    notes: { type: "string" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: ["app_name", "domain", "oauth_docs_url"],
};

const REQUIREMENTS_SCHEMA = {
  type: "object",
  properties: {
    path_key: {
      type: "string",
      enum: ["custom_oauth_app", "managed_oauth", "api_key", "mixed"],
    },
    path_label: { type: "string" },
    path_reason: { type: "string" },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, note: { type: "string" } },
        required: ["label", "note"],
      },
    },
    prerequisites: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          detail: { type: "string" },
          evidence: {
            type: "string",
            enum: ["verified_in_docs", "estimate", "needs_confirmation"],
          },
        },
        required: ["label", "detail", "evidence"],
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          instructions: { type: "array", items: { type: "string" } },
          active_minutes: { type: "number" },
          owner: { type: "string", enum: ["developer", "agent"] },
          done_when: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                hint: { type: "string" },
              },
              required: ["label", "hint"],
            },
          },
          tips: { type: "array", items: { type: "string" } },
          portal_label: { type: "string" },
          portal_url: { type: "string" },
          doc_label: { type: "string" },
          doc_url: { type: "string" },
        },
        required: ["title", "summary", "instructions", "active_minutes", "done_when"],
      },
    },
    coverage_audit: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          status: {
            type: "string",
            enum: ["covered", "not_applicable", "needs_confirmation"],
          },
          detail: { type: "string" },
          doc_url: { type: "string" },
        },
        required: ["area", "status", "detail", "doc_url"],
      },
    },
    blockers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          next_action: { type: "string" },
        },
        required: ["title", "detail", "next_action"],
      },
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          kind: { type: "string", enum: ["official", "community"] },
          supports: { type: "string" },
        },
        required: ["title", "url", "kind", "supports"],
      },
    },
    active_effort_min: { type: "number" },
    active_effort_max: { type: "number" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: [
    "path_key",
    "path_label",
    "path_reason",
    "prerequisites",
    "steps",
    "coverage_audit",
    "blockers",
  ],
};

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    review_required: { type: "boolean" },
    review_summary: { type: "string" },
    external_wait_label: { type: "string" },
    approvals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          condition: { type: "string" },
          evidence: {
            type: "string",
            enum: ["verified_in_docs", "estimate", "needs_confirmation"],
          },
        },
        required: ["title", "condition", "evidence"],
      },
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          kind: { type: "string", enum: ["official", "community"] },
          supports: { type: "string" },
        },
        required: ["title", "url", "kind", "supports"],
      },
    },
  },
  required: ["review_required", "review_summary", "external_wait_label", "sources"],
};

function identifyPrompt(appName, docsUrl) {
  return [
    `You are an OAuth integration researcher. Identify the developer platform behind "${appName}"${
      docsUrl ? ` using ${docsUrl} as the entry point to its documentation` : ""
    }.`,
    "Use web search and rely on the provider's own developer documentation. Never invent a URL or a product name.",
    "",
    "Return:",
    "- app_name: the official product name (e.g. \"HubSpot\", not \"hubspot.com\")",
    "- domain: the bare domain of the official site",
    "- docs_root_url: the developer documentation home",
    "- oauth_docs_url: the page that covers creating an OAuth app, API credentials, or client credentials for third-party apps",
    "- monogram: one character suitable for a logo tile",
    "- tagline: at most 12 words describing the product",
    "- supports_custom_oauth_app: true when a developer can register their own OAuth client",
    "- path_hint: how most integrations authenticate today",
    "- notes: one sentence on anything unusual about their auth setup",
    "- confidence: \"high\" if you reached the official docs, \"medium\" if partial, \"low\" if not",
  ].join("\n");
}

function requirementsPrompt(identity) {
  return [
    `Research and document a complete, actionable integration setup for ${identity.app_name} (${identity.domain}), for a developer connecting an external application.`,
    `Start at ${identity.oauth_docs_url || identity.docs_root_url} and follow the provider's own documentation with web search.`,
    `The identity pass found this authentication hint: ${identity.path_hint || "unknown"}. Verify it against the documentation; do not assume OAuth is the only supported or correct path.`,
    "",
    "Completeness is more important than a short guide:",
    "- Do NOT target or cap the guide at 6–10 steps. Use as many distinct steps as the provider's documented workflow requires. Aim for 8–15 when the flow warrants it, but never invent steps just to reach a number.",
    "- Never collapse separate console tasks, credential operations, or implementation tasks into one high-level step. A reader must be able to follow the sequence without guessing what to do next.",
    "- Research all relevant official pages, not only the first OAuth overview: app registration, authentication/authorization, scopes and product/API enablement, redirect URIs, consent or installation, tokens and refresh, testing/sandbox, app review/publishing, limits, and security guidance.",
    "- Determine whether this provider actually uses OAuth, API keys, a managed integration, or a combination. Give detailed instructions for the recommended documented path; mark other paths not applicable only when the documentation supports that conclusion.",
    "- Include provider-specific branches and prerequisites when they change the steps (for example app type, account/workspace type, test versus production, single- versus multi-tenant, or restricted scopes). State the condition that selects each branch.",
    "- Cover the full lifecycle where documented: eligibility and prerequisites; create/configure the project and app; select the grant/flow and client authentication method; configure exact redirect/callback values; enable APIs/products and least-privilege scopes; configure consent/test users; issue and securely store credentials; implement authorization, callback validation, code exchange and PKCE where required; install/authorize a test account; make and verify a representative API request; handle expiry, refresh, revocation and errors; and production review/publishing/operational requirements.",
    "- For each step provide 3–8 numbered, atomic instructions. Include exact dashboard navigation, field names, literal values/formats, required commands or request details, and expected results only when official docs support them. If a necessary value depends on the developer's own app, label it as their value rather than inventing one.",
    "- Explicitly state when something is undocumented, conditional, or still needs confirmation. Never fill gaps with common OAuth assumptions.",
    "- Where the documentation gives a concrete value or format, quote it exactly: redirect URI shape, scope names, grant type, token endpoint, client authentication, PKCE requirements, environment variable names, token lifetime, refresh/revocation behavior, and relevant API/version limits. Generic advice is not a substitute for provider-specific facts.",
    '- portal_url: the direct link to the exact page in the provider\'s dashboard where that step happens (their app list, app settings, or API credentials page), only when the documentation names that URL or it is the provider\'s documented console home. Never put a documentation page in portal_url — docs belong in doc_url. Leave portal_url as an empty string when you cannot name a real console URL.',
    '- portal_label: two to four words naming that destination, e.g. "Partners dashboard".',
    "- doc_url: a real, directly relevant official documentation page for the step. Include sources for every substantive provider-specific instruction. Never fabricate links.",
    "- done_when: the concrete artifact or state proving the step is finished, e.g. \"Client ID and secret are copied into .env\".",
    "- fields: every value the reader must find or type, as a separate entry with its exact documented label and format. Do not leave a value implicit in prose.",
    "- tips: relevant provider-documented pitfalls only; do not add generic warnings as though the provider requires them.",
    "- Every prerequisite, step, and blocker must be supported by the provider's documentation. Label each prerequisite with \"verified_in_docs\" (the docs state it), \"estimate\" (inferred from the described work), or \"needs_confirmation\" (the docs are unclear).",
    "- active_minutes is estimated focused human work for that step, never waiting time. Do not cap step duration to make the guide look shorter.",
    "- Never invent scopes, redirect paths, menu names, limits, or URLs. If unsure, say so in the instruction and mark it needs_confirmation.",
    "- blockers: at most 3 real reasons this setup fails in practice, each with a next action.",
    "- alternatives: only other connection methods the provider documents (personal API token, managed OAuth product).",
    "- sources: every page you actually used — title, url, kind (\"official\" or \"community\"), and the specific claim it supports.",
    "- coverage_audit: assess every area below. Use \"covered\" only when the guide has actionable steps and a supporting official doc_url; use \"not_applicable\" only when provider docs support that; otherwise use \"needs_confirmation\" and say what remains unknown. Never omit an area or mark all areas covered by implication.",
    "  Required areas: authentication method and account eligibility; developer account/project/app prerequisites; app registration and environment/configuration; authorization flow, client authentication and PKCE; exact redirect/callback rules; APIs/products and scopes/permissions; consent, testers, installation and test-vs-production behavior; credential issuance and secure storage; callback validation and token exchange; test authorization and representative API verification; expiry, refresh, revocation and error handling; app verification/review/publishing and production requirements.",
    "- path_key / path_label / path_reason: the recommended path for a developer connecting an AI agent, and why, in plain language.",
    "- active_effort_min / active_effort_max: total focused work in minutes, not calendar time.",
  ].join("\n");
}

function reviewPrompt(identity) {
  return [
    `Determine whether ${identity.app_name} requires app review, verification, or approval before a third-party integration can serve anyone beyond the developer's own test accounts.`,
    `Search the provider's documentation on app review, verification, publishing, and restricted scopes, starting from ${identity.oauth_docs_url || identity.docs_root_url}.`,
    "",
    "Return:",
    "- review_required: true when apps must be submitted for review to serve users outside the developer's own account",
    "- review_summary: one sentence on when review applies and when it does not",
    '- external_wait_label: the provider\'s stated review time, e.g. "Provider review: 2–6 weeks", or "No provider review documented"',
    '- approvals: each named approval, the condition that triggers it, and its evidence label',
    "- sources: every official page you used — title, url, kind (\"official\" or \"community\"), and the specific claim it supports",
  ].join("\n");
}

async function researchPass(prompt, schema) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_8_flash",
    response_json_schema: schema,
  });
  if (!result) throw new Error("The research pass returned nothing. Try again.");
  return typeof result === "string" ? JSON.parse(result) : result;
}

function dedupeSources(list) {
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  return (list || [])
    .filter((source) => source?.url)
    .filter((source) => {
      const key = source.url.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((source) => ({
      title: source.title || source.url,
      url: source.url,
      kind: source.kind === "community" ? "community" : "official",
      supports: source.supports || "",
      retrieved_at: today,
    }));
}

/**
 * Runs the pipeline. `onStage` fires on every stage transition so the page can
 * render live progress; `onFindings` fires as each pass returns.
 */
export async function runGeneration({ appName, docsUrl, onStage, onFindings }) {
  const mark = (key, status, note) => onStage?.({ key, status, note });
  const found = (patch) => onFindings?.(patch);

  mark("identify", "running");
  const identity = await researchPass(identifyPrompt(appName, docsUrl), IDENTITY_SCHEMA);
  found({ identity });
  mark("identify", "done", identity.domain || identity.app_name);

  mark("requirements", "running");
  const requirements = await researchPass(requirementsPrompt(identity), REQUIREMENTS_SCHEMA);
  found({ requirements });
  const coveredAreas =
    requirements.coverage_audit?.filter((item) => item.status === "covered").length || 0;
  const unconfirmedAreas =
    requirements.coverage_audit?.filter((item) => item.status === "needs_confirmation").length || 0;
  mark(
    "requirements",
    "done",
    `${requirements.steps?.length || 0} steps · ${coveredAreas} areas covered · ${unconfirmedAreas} need confirmation`
  );

  mark("review", "running");
  const review = await researchPass(reviewPrompt(identity), REVIEW_SCHEMA);
  found({ review });
  mark("review", "done", review.review_required ? "Review required" : "No review required");

  mark("compose", "running");
  const guide = parseGeneratedGuide({
    ...identity,
    ...requirements,
    ...review,
    description: identity.notes || identity.tagline,
    coverage_audit: requirements.coverage_audit,
    sources: dedupeSources([...(requirements.sources || []), ...(review.sources || [])]),
  });

  const curated = await findCuratedBySlug(guide.slug);
  if (curated) {
    mark("compose", "done", "Already in the library");
    return { guide: null, duplicate: curated };
  }

  const saved = saveGeneratedGuide(guide);
  mark("compose", "done", "Guide ready");
  return { guide: saved, duplicate: null };
}