/** Prompt + JSON shape for non-technical users (ChatGPT → paste into JSON tab). */

export const JSON_TEMPLATE_EXAMPLE = `{
  "title": "Trh a tržní ekonomika",
  "flashcards": [
    {
      "question": "Co je trh?",
      "answer": "Trh je místo, kde se střetává nabídka s poptávkou a vzniká cena."
    },
    {
      "question": "Jaké jsou subjekty trhu?",
      "answer": "Jednotlivci, podniky a stát."
    }
  ]
}`

export const CHATGPT_PROMPT = `Vytvoř mi sadu studijních kartiček (otázka + odpověď) z textu níže.

PRAVIDLA:
- Odpověz POUZE platným JSON objektem, bez úvodu, bez markdownu, bez \`\`\`json.
- Používej POUZE rovné ASCII uvozovky " (ne „ “ ani ‚ ‘).
- Jazyk otázek i odpovědí: čeština.
- Každá kartička má krátkou otázku a stručnou, přesnou odpověď (1–3 věty).
- Pokryj všechny důležité pojmy, definice a fakta z textu.
- Nepřidávej pole "slug" - URL si aplikace vytvoří sama z názvu.

PŘESNÁ STRUKTURA (dodrž ji 1:1):
{
  "title": "Název tématu",
  "flashcards": [
    { "question": "Otázka?", "answer": "Odpověď." }
  ]
}

PŘÍKLAD:
${JSON_TEMPLATE_EXAMPLE}

--- TEXT KE ZPRACOVÁNÍ (sem vlož svůj výpis / poznámky) ---

`
