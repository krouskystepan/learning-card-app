const CONSONANTS = "bcdfghjkmnpqrstvwxz"
const VOWELS = "aeiou"
const ALNUM = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
const DIGITS = "23456789"
const PUNCT = ".?!-"

function randomInt(max: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]! % max
}

function pick(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)]!
}

/** Short pronounceable chunk, e.g. "bako", "mex". */
function syllable(): string {
  return pick(CONSONANTS) + pick(VOWELS) + pick(CONSONANTS) + pick(VOWELS)
}

function chunk(length: number): string {
  let out = ""
  for (let i = 0; i < length; i += 1) out += pick(ALNUM)
  return out
}

/** Mixed password: readable syllable + simple punctuation + random chars. */
export function generateReadablePassword(): string {
  const a = syllable()
  const b = syllable()
  const mid = chunk(2)
  const digits = pick(DIGITS) + pick(DIGITS)
  const p1 = pick(PUNCT)
  const p2 = pick(".?!")
  return `${a}${p1}${mid}${p2}${b}${digits}`
}
