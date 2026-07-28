/** Normalize ChatGPT paste quirks into parseable JSON. */
export function sanitizeJsonText(raw: string): string {
  let text = raw.trim();

  // Strip ```json ... ``` / ``` ... ``` wrappers
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1].trim();

  // Curly / smart quotes → straight ASCII quotes
  text = text
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // Invisible BOM / zero-width chars
  text = text.replace(/^\uFEFF/, "").replace(/[\u200B-\u200D\uFEFF]/g, "");

  return text;
}

export function parseJsonObject(raw: string): unknown {
  const text = sanitizeJsonText(raw);
  try {
    return JSON.parse(text);
  } catch (first) {
    // Trailing commas (another common LLM slip)
    const withoutTrailingCommas = text.replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(withoutTrailingCommas);
    } catch {
      throw first instanceof Error ? first : new Error("Neplatný JSON");
    }
  }
}
