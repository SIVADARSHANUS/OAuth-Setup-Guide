import React from "react";
import { BadgeCheck, Building2, FileText, Globe, ListChecks, ShieldCheck } from "lucide-react";

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <div className="min-w-0 text-sm leading-relaxed">
        <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </span>
        <p className="break-words text-foreground/90">{children}</p>
      </div>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div className="mt-4 border-t border-border/70 pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </div>
  );
}

export default function ResearchDigest({ findings }) {
  const { identity, requirements, review } = findings;
  const nothingYet = !identity;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        What it found
      </p>

      {nothingYet && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Findings appear here as each pass completes.
        </p>
      )}

      {identity && (
        <div className="mt-3">
          <Group title="Identity">
            <Row icon={Building2} label="App">
              {identity.app_name}
            </Row>
            <Row icon={Globe} label="Domain">
              {identity.domain || "Not confirmed"}
            </Row>
            {identity.oauth_docs_url && (
              <Row icon={FileText} label="Documentation">
                <a
                  href={identity.oauth_docs_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-2 hover:text-brand"
                >
                  {identity.oauth_docs_url}
                </a>
              </Row>
            )}
            <Row icon={BadgeCheck} label="Client registration">
              {identity.supports_custom_oauth_app
                ? "Developers can register their own OAuth app"
                : "Custom OAuth app not confirmed"}
            </Row>
          </Group>
        </div>
      )}

      {requirements?.steps?.length > 0 && (
        <Group title="Documentation pass">
          <Row icon={ListChecks} label="Found">
            {requirements.prerequisites?.length || 0} prerequisites ·{" "}
            {requirements.steps.length} steps · {requirements.blockers?.length || 0} blockers
          </Row>
          <ul className="space-y-1 pl-6 text-sm leading-relaxed text-foreground/90">
            {requirements.steps.slice(0, 3).map((step, index) => (
              <li key={step.title || index} className="list-disc">
                {step.title}
              </li>
            ))}
            {requirements.steps.length > 3 && (
              <li className="list-none text-xs text-muted-foreground">
                +{requirements.steps.length - 3} more
              </li>
            )}
          </ul>
        </Group>
      )}

      {requirements?.coverage_audit?.length > 0 && (
        <Group title="Coverage audit">
          <Row icon={ListChecks} label="Assessed">
            {requirements.coverage_audit.filter((item) => item.status === "covered").length} covered ·{" "}
            {requirements.coverage_audit.filter((item) => item.status === "not_applicable").length} not applicable ·{" "}
            {requirements.coverage_audit.filter((item) => item.status === "needs_confirmation").length} need confirmation
          </Row>
        </Group>
      )}

      {review && (
        <Group title="Approval policy">
          <Row icon={ShieldCheck} label={review.review_required ? "Review required" : "Review"}>
            {review.review_summary}
          </Row>
          {review.external_wait_label && (
            <p className="pl-6 text-xs text-muted-foreground">{review.external_wait_label}</p>
          )}
          {review.sources?.length > 0 && (
            <p className="pl-6 text-xs text-muted-foreground">
              {review.sources.length} documentation {review.sources.length === 1 ? "page" : "pages"} cited
            </p>
          )}
        </Group>
      )}
    </div>
  );
}