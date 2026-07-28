/** Prompt + JSON shape for non-technical users (ChatGPT → paste into JSON tab). */

export const CHATGPT_PROMPT = `ÚKOL: Přečti CELÝ zdrojový text (včetně přílohy / nahraného souboru) a vytvoř z něj sadu studijních kartiček.

DŮLEŽITÉ - co NEMÁŠ dělat:
- NEVRACEJ prázdnou šablonu ani placeholdery typu "Název tématu", "Otázka?", "Odpověď."
- NEKOPÍRUJ formát níže 1:1 s tečkami - vyplň ho reálným obsahem ze zdroje.
- NEIGNORUJ text v příloze / souboru. Pokud je text nahraný jako soubor, otevři ho a zpracuj celý obsah.

CO MÁŠ udělat:
1. Přečti celý zdroj (text níže NEBO obsah přiloženého souboru).
2. Vymysli výstižný "title" podle tématu textu.
3. Vytvoř co nejvíce užitečných kartiček: pokryj všechny důležité pojmy, definice, vztahy a fakta.
4. Odpověz POUZE jedním platným JSON objektem - bez úvodu, bez markdownu, bez \`\`\`json.

PRAVIDLA JSON:
- Používej POUZE rovné ASCII uvozovky " (ne „ “ ani ‚ ‘).
- Jazyk otázek i odpovědí: čeština.
- Každá kartička: krátká otázka + stručná, přesná odpověď (1-3 věty).
- Pole: pouze "title" a "flashcards" (každá kartička má "question" a "answer").
- Nepřidávej "slug".

FORMÁT (vyplň REÁLNÝM obsahem ze zdroje):
{
  "title": "...",
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}

--- ZDROJOVÝ TEXT ---
(Pokud jsi nahrál/a soubor, zpracuj ten. Jinak vlož text sem pod tento řádek.)

`
