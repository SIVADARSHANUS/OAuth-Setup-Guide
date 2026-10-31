import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchBar({ value, onChange, onSubmit, busy }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="flex w-full items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-[0_1px_2px_rgba(33,29,26,0.04)] transition-shadow focus-within:border-brand/40 focus-within:shadow-[0_2px_16px_-8px_rgba(117,71,47,0.35)] sm:max-w-xl"
      role="search"
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="App name, domain, or URL — e.g. Linear or linear.app"
        aria-label="Search integrations"
        className="h-9 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="sm" className="h-9 shrink-0 px-4" disabled={busy}>
        Search
      </Button>
    </form>
  );
}