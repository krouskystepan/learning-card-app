"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CHATGPT_PROMPT, JSON_TEMPLATE_EXAMPLE } from "@/lib/chatgpt-template";

export function ChatGptTemplate() {
  const [copied, setCopied] = useState<"prompt" | "example" | null>(null);

  async function copy(kind: "prompt" | "example", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      toast.success(
        kind === "prompt" ? "Prompt zkopírován" : "Ukázka JSON zkopírována",
      );
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Kopírování selhalo");
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
      <div>
        <h3 className="font-card text-base font-semibold">
          Šablona pro ChatGPT
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          1) Zkopíruj prompt → 2) vlož ho do ChatGPT a pod něj svůj text → 3)
          zkopíruj odpověď sem dolů a ulož.
        </p>
      </div>

      <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-background p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
        {CHATGPT_PROMPT.trimEnd()}
        {"\n\n[sem vlož svůj text]"}
      </pre>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => copy("prompt", CHATGPT_PROMPT)}
        >
          {copied === "prompt" ? (
            <Check data-icon="inline-start" />
          ) : (
            <Copy data-icon="inline-start" />
          )}
          {copied === "prompt" ? "Zkopírováno" : "Kopírovat prompt"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => copy("example", JSON_TEMPLATE_EXAMPLE)}
        >
          {copied === "example" ? (
            <Check data-icon="inline-start" />
          ) : (
            <Copy data-icon="inline-start" />
          )}
          {copied === "example" ? "Zkopírováno" : "Kopírovat ukázku JSON"}
        </Button>
      </div>
    </div>
  );
}
