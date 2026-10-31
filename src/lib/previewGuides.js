import { appParams } from "@/lib/app-params";
import { slugify } from "@/lib/format";

export const isPreviewMode = !appParams.appBaseUrl;

const commonSteps = [
  {
    step_id: "confirm-auth",
    title: "Confirm the provider's OAuth requirements",
    summary: "Check the provider documentation for supported auth flows and prerequisites.",
    instructions: [
      "Open the provider's official developer documentation.",
      "Confirm OAuth is supported for the product and account type you plan to connect.",
      "Note any developer account, workspace, or test-account requirements.",
    ],
    fields: [{ label: "Prerequisites", hint: "Record the requirements listed in the provider docs." }],
    tips: ["Provider requirements can vary by account type and change over time."],
    active_minutes: 5,
    owner: "developer",
    done_when: "You have confirmed the supported auth flow and prerequisites in the provider docs.",
  },
  {
    step_id: "register-app",
    title: "Register an OAuth app",
    summary: "Create or select an app in the provider's developer console.",
    instructions: [
      "Open the provider's developer console using its official documentation.",
      "Create an app or select an existing app for this integration.",
      "Record the app name and any environment or distribution settings you choose.",
    ],
    fields: [{ label: "App details", hint: "Use the fields and naming rules required by the provider." }],
    tips: ["Do not use a production app for testing unless the provider recommends it."],
    active_minutes: 10,
    owner: "developer",
    done_when: "The provider console shows an app for this integration.",
  },
  {
    step_id: "redirect-uri",
    title: "Configure the redirect URL",
    summary: "Register the callback URL used by your application.",
    instructions: [
      "Copy the OAuth callback URL from your integration or application configuration.",
      "Add that exact URL to the redirect or callback URL setting in the provider console.",
      "Save the app settings and check for validation errors.",
    ],
    fields: [
      {
        label: "Redirect or callback URL",
        hint: "Use the exact value from your app; this preview does not supply a provider-specific URL.",
      },
    ],
    tips: ["Redirect URL matching rules are provider-specific; verify them in the official docs."],
    active_minutes: 5,
    owner: "developer",
    done_when: "The provider console accepts and displays your application's callback URL.",
  },
  {
    step_id: "permissions",
    title: "Choose the required permissions",
    summary: "Request only the access needed for the integration's features.",
    instructions: [
      "List the data and actions the integration needs.",
      "Match each requirement to permissions documented by the provider.",
      "Select the minimum required permissions in the app settings.",
    ],
    fields: [{ label: "Permissions or scopes", hint: "Use the exact names from the provider's current documentation." }],
    tips: ["Some providers require users to reconnect after requested permissions change."],
    active_minutes: 10,
    owner: "developer",
    done_when: "The app requests only the documented permissions needed for its features.",
  },
  {
    step_id: "test-connection",
    title: "Store credentials and test the connection",
    summary: "Keep credentials private and verify the full authorization flow with a test account.",
    instructions: [
      "Copy the client credentials from the provider console.",
      "Store secrets in your application's secret manager or local environment, not in source control.",
      "Authorize with a test account and verify the expected data and actions.",
      "Review the provider's publishing or app-review requirements before serving other users.",
    ],
    fields: [{ label: "Client credentials", hint: "Use the credential names and storage method required by your integration." }],
    tips: ["Never paste a client secret into a public repository or browser-visible code."],
    active_minutes: 10,
    owner: "developer",
    done_when: "A test account completes authorization and the integration behaves as expected.",
  },
];

const additionalPreviewSteps = [
  {
    step_id: "prepare-project",
    title: "Prepare the developer project and test environment",
    summary: "Set up the developer project and a non-production account for implementation.",
    instructions: [
      "Create or select the developer organization or project required by the provider.",
      "Confirm which roles or account plans are allowed to create apps.",
      "Create a separate development or sandbox environment when supported.",
      "Record the test account, workspace, or tenant to use during authorization.",
    ],
    fields: [{ label: "Developer project", hint: "Check organization and environment requirements in official docs." }],
    tips: ["Keep development credentials and test data separate from production."],
    active_minutes: 10,
    owner: "developer",
    done_when: "A permitted developer project and test environment are ready.",
  },
  {
    step_id: "select-flow",
    title: "Select the authorization flow and client security",
    summary: "Confirm the grant, client authentication, and PKCE requirements.",
    instructions: [
      "Select the authorization flow documented for this app type and client environment.",
      "Confirm whether the client is public or confidential and how it authenticates to token endpoints.",
      "Check whether PKCE is required or recommended and identify the supported challenge method.",
      "Record state, nonce, issuer, and audience validation requirements when applicable.",
    ],
    fields: [{ label: "Grant and client method", hint: "Copy the exact documented flow; do not infer it." }],
    tips: ["Browser and mobile clients must not expose confidential secrets."],
    active_minutes: 10,
    owner: "developer",
    done_when: "The supported grant and client-security requirements are recorded.",
  },
  {
    step_id: "enable-products",
    title: "Enable required APIs and products",
    summary: "Activate the provider products or APIs this integration will call.",
    instructions: [
      "List the provider products and API operations needed by the integration.",
      "Enable each required API or product in the developer project.",
      "Check for separate access approval or product enrollment requirements.",
      "Record relevant API version, endpoint, and account availability rules.",
    ],
    fields: [{ label: "Enabled products and APIs", hint: "Use documented product names and activation instructions." }],
    tips: ["OAuth permission alone may not grant access to an API."],
    active_minutes: 10,
    owner: "developer",
    done_when: "The project can access each API or product the integration needs.",
  },
  {
    step_id: "consent-test-users",
    title: "Configure consent, testers, and installation",
    summary: "Set up provider-required consent fields and test-user access.",
    instructions: [
      "Complete the consent-screen fields required before authorization can start.",
      "Add approved test users or workspaces when the app is in development mode.",
      "Check whether an administrator must approve installation or requested permissions.",
      "Install the app into the intended test account using the documented flow.",
      "Record differences between test and production app modes.",
    ],
    fields: [{ label: "Test users or workspace", hint: "Use only accounts permitted by the provider's testing policy." }],
    tips: ["Test-mode access limits can differ from production."],
    active_minutes: 10,
    owner: "developer",
    done_when: "A permitted test user or workspace can start the consent flow.",
  },
  {
    step_id: "secure-credentials",
    title: "Issue and securely store client credentials",
    summary: "Create credentials and keep confidential values out of client code.",
    instructions: [
      "Generate or reveal credentials using the provider's documented console workflow.",
      "Record client identifiers and any other non-secret values required by the app.",
      "Store confidential secrets in a server-side secret manager or protected local environment.",
      "Keep credentials out of source control and browser/mobile bundles.",
      "Check credential environment restrictions, expiry, and rotation requirements.",
    ],
    fields: [{ label: "Credential names and storage", hint: "Follow documented names and your app's secret-storage conventions." }],
    tips: ["Never assume a secret embedded in distributed client code is private."],
    active_minutes: 10,
    owner: "developer",
    done_when: "Credentials are stored outside source control and available only to the appropriate runtime.",
  },
  {
    step_id: "implement-callback",
    title: "Implement authorization and callback handling",
    summary: "Wire the authorization request, callback validation, and token exchange.",
    instructions: [
      "Build the authorization request with the documented endpoint and required parameters.",
      "Generate and validate state; add PKCE or nonce handling when required.",
      "Handle the callback and reject mismatched state or invalid response data.",
      "Exchange the authorization code using the documented token endpoint and client-auth method.",
      "Store returned tokens on the appropriate server-side boundary.",
    ],
    fields: [{ label: "Authorization and token endpoints", hint: "Use exact endpoints and parameter formats from provider docs." }],
    tips: ["Do not accept callback responses until required security parameters are validated."],
    active_minutes: 15,
    owner: "developer",
    done_when: "The callback validates the response and completes the documented token exchange.",
  },
  {
    step_id: "token-lifecycle",
    title: "Handle expiry, refresh, revocation, and failures",
    summary: "Implement the documented token lifecycle and recovery behavior.",
    instructions: [
      "Check whether access tokens expire and whether refresh or reauthorization is supported.",
      "Implement documented token refresh and rotation behavior when applicable.",
      "Handle revoked access, expired credentials, rate limits, and recoverable errors.",
      "Provide a safe disconnect/revoke path if the provider documents one.",
      "Avoid logging secrets or full token responses while debugging.",
    ],
    fields: [{ label: "Token lifecycle rules", hint: "Record expiry, refresh, rotation, and revocation behavior." }],
    tips: ["Refresh-token rotation and one-time-use rules differ by provider."],
    active_minutes: 10,
    owner: "developer",
    done_when: "The integration responds safely to expiry, refresh, revocation, and auth errors.",
  },
  {
    step_id: "production-review",
    title: "Complete production review and operational checks",
    summary: "Verify requirements before onboarding real users or deploying broadly.",
    instructions: [
      "Check for app verification, security review, or provider approval requirements.",
      "Identify restricted scopes, user limits, branding rules, and submission materials.",
      "Separate production credentials and callback URLs from development settings.",
      "Document credential rotation, access monitoring, and incident-response ownership.",
      "Confirm publishing and rollback steps in the provider's current docs.",
    ],
    fields: [{ label: "Production release requirements", hint: "Record review status, limits, and deployment requirements." }],
    tips: ["A successful test authorization does not mean public use is approved."],
    active_minutes: 10,
    owner: "developer",
    done_when: "Production approval, configuration, and credential operations are understood before launch.",
  },
];

const comprehensivePreviewSteps = [
  commonSteps[0],
  additionalPreviewSteps[0],
  commonSteps[1],
  additionalPreviewSteps[1],
  commonSteps[2],
  additionalPreviewSteps[2],
  commonSteps[3],
  additionalPreviewSteps[3],
  additionalPreviewSteps[4],
  additionalPreviewSteps[5],
  commonSteps[4],
  additionalPreviewSteps[6],
  additionalPreviewSteps[7],
];

const previewAuditAreas = [
  "Authentication method and account eligibility",
  "Developer account, project, and app prerequisites",
  "App registration and environment configuration",
  "Authorization flow, client authentication, and PKCE",
  "Exact redirect and callback rules",
  "APIs, products, scopes, and permissions",
  "Consent, testers, installation, and test-vs-production behavior",
  "Credential issuance and secure storage",
  "Callback validation and token exchange",
  "Test authorization and API verification",
  "Expiry, refresh, revocation, and error handling",
  "App verification, review, publishing, and production requirements",
].map((area) => ({
  area,
  status: "needs_confirmation",
  detail: "Not researched in frontend preview; verify this area in the provider's current official documentation.",
  doc_url: "",
}));

const providers = [
  {
    app_name: "Shopify",
    slug: "shopify",
    domain: "shopify.dev",
    monogram: "S",
    tagline: "Preview the OAuth setup flow for a Shopify integration.",
    docs_url: "https://shopify.dev/docs/apps",
  },
  {
    app_name: "Slack",
    slug: "slack",
    domain: "api.slack.com",
    monogram: "S",
    tagline: "Preview the OAuth setup flow for a Slack integration.",
    docs_url: "https://api.slack.com/authentication/oauth-v2",
  },
  {
    app_name: "Google",
    slug: "google",
    domain: "developers.google.com",
    monogram: "G",
    tagline: "Preview the OAuth setup flow for a Google integration.",
    docs_url: "https://developers.google.com/identity/protocols/oauth2",
  },
  {
    app_name: "Notion",
    slug: "notion",
    domain: "developers.notion.com",
    monogram: "N",
    tagline: "Preview the OAuth setup flow for a Notion integration.",
    docs_url: "https://developers.notion.com/docs/authorization",
  },
];

export const PREVIEW_GUIDES = providers.map((provider, index) => ({
  id: `preview_${provider.slug}`,
  ...provider,
  previewOnly: true,
  description:
    "Illustrative OAuth checklist for previewing the app. The steps are generic, not researched or verified for this provider.",
  path_key: "custom_oauth_app",
  path_label: "OAuth setup (preview)",
  path_reason:
    "This example demonstrates the guide format only. Check the provider's current documentation to confirm its supported setup path.",
  alternatives: [],
  difficulty: "medium",
  confidence: "low",
  active_effort_min: 90,
  active_effort_max: 150,
  external_wait_label: "Not checked in preview mode",
  review_required: false,
  review_summary: "Review and publishing requirements have not been checked in this preview.",
  prerequisites: [
    {
      label: "Provider developer access",
      detail: "Confirm the required account, workspace, or developer access in the official documentation.",
      evidence: "needs_confirmation",
    },
    {
      label: "Application callback URL",
      detail: "Have the exact OAuth redirect URL from your application ready.",
      evidence: "needs_confirmation",
    },
  ],
  steps: comprehensivePreviewSteps.map((step) => ({ ...step, step_id: `${provider.slug}-${step.step_id}` })),
  coverage_audit: previewAuditAreas,
  approvals: [],
  blockers: [],
  sources: [
    {
      title: `${provider.app_name} developer documentation`,
      url: provider.docs_url,
      kind: "official",
      supports: "Starting point only; confirm current provider-specific requirements. This preview makes no verified claims.",
    },
  ],
  last_verified: "",
  version: "Preview",
  previewTemplateVersion: 2,
  status: "curated",
  popular_rank: index + 1,
}));

export function getPreviewGuideBySlug(slug) {
  return PREVIEW_GUIDES.find((guide) => guide.slug === slug) ?? null;
}

export function getPreviewGuideById(id) {
  return PREVIEW_GUIDES.find((guide) => guide.id === id) ?? null;
}

export function findPreviewGuideByName(name) {
  const normalized = name.trim().toLowerCase();
  return PREVIEW_GUIDES.find((guide) =>
    [guide.app_name, guide.slug, guide.domain].some((value) => value.toLowerCase() === normalized)
  ) ?? null;
}

export function createPreviewDraft(appName, docsUrl = "") {
  const name = appName.trim();
  if (!name) throw new Error("Enter an app name to create a draft guide.");

  let documentationUrl = "";
  let domain = "Not researched";
  if (docsUrl.trim()) {
    let parsedUrl;
    try {
      parsedUrl = new URL(docsUrl.trim());
    } catch {
      throw new Error("Enter a complete documentation URL starting with https://.");
    }
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Documentation links must start with http:// or https://.");
    }
    documentationUrl = parsedUrl.href;
    domain = parsedUrl.hostname;
  }

  const slug = slugify(name) || "integration";
  return {
    id: `preview_draft_${slug}`,
    app_name: name,
    slug,
    domain,
    monogram: name.slice(0, 1).toUpperCase(),
    tagline: `A starter OAuth checklist for ${name}.`,
    description:
      "A generic starter checklist generated locally for preview. It has not been researched against this provider's documentation.",
    docs_root_url: documentationUrl,
    previewOnly: true,
    previewDraft: true,
    path_key: "custom_oauth_app",
    path_label: "OAuth setup (draft)",
    path_reason:
      "This is a generic starting point only. Confirm the provider's supported authentication method and exact setup requirements before implementing.",
    alternatives: [],
    difficulty: "medium",
    confidence: "low",
    active_effort_min: 90,
    active_effort_max: 150,
    external_wait_label: "Not researched",
    review_required: false,
    review_summary: "App review and publishing requirements have not been researched.",
    prerequisites: [
      {
        label: "Provider developer access",
        detail: "Check the provider's official documentation for account and developer access requirements.",
        evidence: "needs_confirmation",
      },
      {
        label: "Application callback URL",
        detail: "Get the callback URL from your app and confirm the exact format required by the provider.",
        evidence: "needs_confirmation",
      },
    ],
    steps: comprehensivePreviewSteps.map((step) => ({ ...step, step_id: `${slug}-${step.step_id}` })),
    coverage_audit: previewAuditAreas,
    approvals: [],
    blockers: [],
    sources: [],
    last_verified: "",
    version: "Draft 2",
    previewTemplateVersion: 2,
    status: "generated",
  };
}

export function upgradePreviewDraft(guide) {
  if (!guide?.previewDraft || guide.previewTemplateVersion >= 2) return guide;

  const slug = guide.slug || slugify(guide.app_name) || "integration";
  return {
    ...guide,
    active_effort_min: 90,
    active_effort_max: 150,
    steps: comprehensivePreviewSteps.map((step) => ({
      ...step,
      step_id: `${slug}-${step.step_id}`,
    })),
    coverage_audit: previewAuditAreas,
    version: "Draft 2",
    previewTemplateVersion: 2,
  };
}
