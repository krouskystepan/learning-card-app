'use client'

import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { generateReadablePassword } from '@/lib/readable-password'

type Mode = 'custom' | 'generated'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  label?: string
}

export function AdminPasswordField({
  id,
  value,
  onChange,
  label = 'Heslo'
}: Props) {
  const [mode, setMode] = useState<Mode>('custom')
  const [copied, setCopied] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setCopied(false)
    if (next === 'generated') {
      onChange(generateReadablePassword())
    } else {
      onChange('')
    }
  }

  function regenerate() {
    onChange(generateReadablePassword())
    setCopied(false)
  }

  async function copyPassword() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Heslo zkopírováno')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Kopírování selhalo')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => {
            if (v === 'custom' || v === 'generated') switchMode(v)
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Způsob nastavení hesla"
        >
          <ToggleGroupItem
            value="custom"
            className="px-2.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
          >
            Vlastní
          </ToggleGroupItem>
          <ToggleGroupItem
            value="generated"
            className="px-2.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
          >
            Vygenerovat
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === 'custom' ? (
        <PasswordInput
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          placeholder="min. 8 znaků"
          required
          minLength={8}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              id={id}
              className="flex h-8 flex-1 items-center rounded-lg border border-input bg-muted/40 px-3 font-mono text-sm tracking-wide"
            >
              {value || '-'}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={regenerate}
              aria-label="Vygenerovat jiné heslo"
            >
              <RefreshCw />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyPassword}
              disabled={!value}
              aria-label="Kopírovat heslo"
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
          <input type="hidden" name={id} value={value} required minLength={8} />
        </div>
      )}
    </div>
  )
}
