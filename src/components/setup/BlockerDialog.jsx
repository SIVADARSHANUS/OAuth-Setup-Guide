import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function BlockerDialog({ open, onOpenChange, stepTitle, reason, onSubmit }) {
  const [value, setValue] = useState(reason || "");

  useEffect(() => {
    if (open) setValue(reason || "");
  }, [open, reason]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">Record a blocker</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Note what stopped you on “{stepTitle}”. It stays in this browser and is never
            included in a shared guide.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. Workspace admin has to approve the app install first"
          rows={4}
          className="resize-none text-sm"
        />

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!value.trim()}
            onClick={() => {
              onSubmit(value.trim());
              onOpenChange(false);
            }}
          >
            Save blocker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}