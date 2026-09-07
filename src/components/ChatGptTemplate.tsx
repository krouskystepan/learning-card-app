'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CHATGPT_PROMPT } from '@/lib/chatgpt-template'

export function ChatGptTemplate() {
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(CHATGPT_PROMPT)
      setCopied(true)
      toast.success('Prompt zkopírován')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Kopírování selhalo')
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
      <div>
        <h3 className="font-card text-base font-semibold">
          Šablona pro ChatGPT
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          1) Zkopíruj prompt → 2) vlož ho do ChatGPT a pod něj text (nebo přilož
          soubor) → 3) zkopíruj celý JSON sem dolů a ulož. ChatGPT nesmí vrátit
          jen prázdnou šablonu - musí naplnit kartičky ze zdroje.
        </p>
      </div>

      <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-background p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
        {CHATGPT_PROMPT.trimEnd()}
        {'\n\n[sem vlož svůj text]'}
      </pre>

      <Button type="button" size="sm" onClick={copyPrompt}>
        {copied ? (
          <Check data-icon="inline-start" />
        ) : (
          <Copy data-icon="inline-start" />
        )}
        {copied ? 'Zkopírováno' : 'Kopírovat prompt'}
      </Button>
    </div>
  )
}
