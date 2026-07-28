import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ALargeSmall,
  ArrowLeftRight,
  Atom,
  Banknote,
  BookA,
  BookMarked,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Coins,
  CreditCard,
  Euro,
  Feather,
  FileSpreadsheet,
  FlaskConical,
  FolderOpen,
  Globe,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Landmark,
  Languages,
  LayoutGrid,
  Leaf,
  Library,
  MessageCircle,
  Music,
  NotebookPen,
  NotebookTabs,
  Percent,
  PiggyBank,
  Quote,
  Receipt,
  Scale,
  ScrollText,
  Sigma,
  SpellCheck,
  Table2,
  Wallet
} from 'lucide-react'

export const SECTION_ICON_IDS = [
  'folder',
  'subjects',
  'library',
  'notebook',
  'tabs',
  'bookmark',
  'book',
  'graduation',
  'accounting',
  'table',
  'receipt',
  'wallet',
  'coins',
  'euro',
  'piggy',
  'cashflow',
  'banknote',
  'hand-coins',
  'card',
  'czech',
  'quote',
  'spellcheck',
  'feather',
  'math',
  'percent',
  'calculator',
  'english',
  'speech',
  'languages',
  'landmark',
  'scale',
  'globe',
  'flask',
  'music',
  'heart',
  'briefcase',
  'building',
  'leaf',
  'atom',
  'scroll'
] as const

export type SectionIconId = (typeof SECTION_ICON_IDS)[number]

export const SECTION_ICONS: Record<
  SectionIconId,
  { label: string; Icon: LucideIcon }
> = {
  folder: { label: 'Složka', Icon: FolderOpen },
  subjects: { label: 'Předměty', Icon: LayoutGrid },
  library: { label: 'Knihovna', Icon: Library },
  notebook: { label: 'Sešit', Icon: NotebookPen },
  tabs: { label: 'Předmětové záložky', Icon: NotebookTabs },
  bookmark: { label: 'Záložka', Icon: BookMarked },
  book: { label: 'Kniha', Icon: BookOpen },
  graduation: { label: 'Maturita', Icon: GraduationCap },
  accounting: { label: 'Účetnictví', Icon: FileSpreadsheet },
  table: { label: 'Tabulka', Icon: Table2 },
  receipt: { label: 'Doklad', Icon: Receipt },
  wallet: { label: 'Peněženka', Icon: Wallet },
  coins: { label: 'Mince', Icon: Coins },
  euro: { label: 'Euro', Icon: Euro },
  piggy: { label: 'Úspory', Icon: PiggyBank },
  cashflow: { label: 'Peněžní provoz', Icon: ArrowLeftRight },
  banknote: { label: 'Bankovka', Icon: Banknote },
  'hand-coins': { label: 'Hotovost', Icon: HandCoins },
  card: { label: 'Karta', Icon: CreditCard },
  czech: { label: 'Čeština', Icon: BookA },
  quote: { label: 'Citát', Icon: Quote },
  spellcheck: { label: 'Pravopis', Icon: SpellCheck },
  feather: { label: 'Literatura', Icon: Feather },
  math: { label: 'Matematika', Icon: Sigma },
  percent: { label: 'Procenta', Icon: Percent },
  calculator: { label: 'Kalkulačka', Icon: Calculator },
  english: { label: 'Angličtina', Icon: ALargeSmall },
  speech: { label: 'Konverzace', Icon: MessageCircle },
  languages: { label: 'Jazyky', Icon: Languages },
  landmark: { label: 'Ekonomie', Icon: Landmark },
  scale: { label: 'Právo', Icon: Scale },
  globe: { label: 'Zeměpis', Icon: Globe },
  flask: { label: 'Chemie', Icon: FlaskConical },
  music: { label: 'Hudba', Icon: Music },
  heart: { label: 'Zdraví', Icon: HeartPulse },
  briefcase: { label: 'Byznys', Icon: Briefcase },
  building: { label: 'Stát', Icon: Building2 },
  leaf: { label: 'Příroda', Icon: Leaf },
  atom: { label: 'Fyzika', Icon: Atom },
  scroll: { label: 'Historie', Icon: ScrollText }
}

/** Old icon ids → current (same visual was duplicated under another id). */
const LEGACY_ICON_IDS: Record<string, SectionIconId> = {
  spreadsheet: 'accounting',
  'book-a': 'czech',
  pen: 'czech',
  sigma: 'math',
  letters: 'english',
  dollar: 'euro'
}

/** Even rainbow stops - one clear hue each. */
export const SECTION_COLOR_IDS = [
  'coral',
  'orange',
  'amber',
  'lime',
  'green',
  'teal',
  'sky',
  'blue',
  'indigo',
  'violet',
  'fuchsia',
  'rose'
] as const

export type SectionColorId = (typeof SECTION_COLOR_IDS)[number]

/** Soft accents via CSS - swatches use full rainbow chroma. */
export const SECTION_COLORS: Record<
  SectionColorId,
  { label: string; hue: string }
> = {
  coral: { label: 'Červená', hue: '25' },
  orange: { label: 'Oranžová', hue: '55' },
  amber: { label: 'Žlutá', hue: '90' },
  lime: { label: 'Limetková', hue: '125' },
  green: { label: 'Zelená', hue: '150' },
  teal: { label: 'Tyrkysová', hue: '180' },
  sky: { label: 'Azurová', hue: '210' },
  blue: { label: 'Modrá', hue: '250' },
  indigo: { label: 'Indigo', hue: '275' },
  violet: { label: 'Fialová', hue: '300' },
  fuchsia: { label: 'Fuchsiová', hue: '330' },
  rose: { label: 'Růžová', hue: '350' }
}

/** Old color ids → nearest kept stop. */
const LEGACY_COLOR_IDS: Record<string, SectionColorId> = {
  pink: 'rose',
  yellow: 'amber',
  emerald: 'green',
  cyan: 'teal',
  purple: 'violet',
  stone: 'orange',
  slate: 'blue'
}

export const DEFAULT_SECTION_ICON: SectionIconId = 'folder'
export const DEFAULT_SECTION_COLOR: SectionColorId = 'rose'

export function isSectionIconId(value: unknown): value is SectionIconId {
  return (
    typeof value === 'string' &&
    (SECTION_ICON_IDS as readonly string[]).includes(value)
  )
}

export function isSectionColorId(value: unknown): value is SectionColorId {
  return (
    typeof value === 'string' &&
    (SECTION_COLOR_IDS as readonly string[]).includes(value)
  )
}

export function normalizeSectionIcon(value: unknown): SectionIconId {
  if (typeof value !== 'string') return DEFAULT_SECTION_ICON
  if (isSectionIconId(value)) return value
  return LEGACY_ICON_IDS[value] ?? DEFAULT_SECTION_ICON
}

export function normalizeSectionColor(value: unknown): SectionColorId {
  if (typeof value !== 'string') return DEFAULT_SECTION_COLOR
  if (isSectionColorId(value)) return value
  return LEGACY_COLOR_IDS[value] ?? DEFAULT_SECTION_COLOR
}

export function sectionColorVars(colorId: SectionColorId): CSSProperties {
  const { hue } = SECTION_COLORS[colorId]
  return {
    ['--section-hue' as string]: hue
  }
}
