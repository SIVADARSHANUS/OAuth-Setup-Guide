import React, { useEffect, useState } from "react";
import { MessageSquare, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addStepComment, deleteStepComment, readStepComments } from "@/lib/comments";

function stamp(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StepComments({ guideId, stepId }) {
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setComments(readStepComments(guideId, stepId));
    setDraft("");
  }, [guideId, stepId]);

  const submit = () => {
    if (!draft.trim()) return;
    setComments(addStepComment(guideId, stepId, draft));
    setDraft("");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-heading text-sm font-semibold tracking-tight">
          <MessageSquare className="h-4 w-4 text-brand" strokeWidth={1.75} />
          Comments on this step
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {comments.length ? `${comments.length} note${comments.length === 1 ? "" : "s"}` : "None yet"}
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Notes for this step only — saved on this device. Handy for console values, an app ID, or a
        support ticket reference.
      </p>

      {comments.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{stamp(comment.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setComments(deleteStepComment(guideId, stepId, comment.id))}
                aria-label="Delete note"
                className="rounded p-1 text-muted-foreground opacity-60 transition-colors hover:bg-accent hover:text-blocked group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. Client ID 1234…apps.googleusercontent.com — copied into .env.local"
          rows={2}
          className="resize-none bg-background text-sm"
          aria-label="Add a comment to this step"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
            Add comment
          </Button>
        </div>
      </div>
    </section>
  );
}