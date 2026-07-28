import { z } from "zod";

export const flashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const topicFormSchema = z.object({
  sectionSlug: z.string().min(1, "Vyber sekci"),
  title: z.string().trim().min(1, "Název tématu je povinný"),
  flashcards: z
    .array(flashcardSchema)
    .min(1, "Přidej alespoň jednu kartičku"),
});

export const topicPayloadSchema = z.object({
  sectionSlug: z.string().min(1).optional(),
  title: z.string().trim().min(1, "JSON musí mít „title“"),
  flashcards: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .min(1, "JSON musí mít „flashcards“"),
});

export type TopicFormValues = z.infer<typeof topicFormSchema>;
export type TopicPayload = z.infer<typeof topicPayloadSchema>;

export const EMPTY_CARD = { question: "", answer: "" };

/** Same order as study (first = first). */
export function toEditorCards(
  cards: { question: string; answer: string }[],
) {
  return cards.length ? [...cards] : [EMPTY_CARD];
}

/** Persist non-empty cards in editor order (= study order). */
export function toPersistCards(
  cards: { question: string; answer: string }[],
) {
  return cards
    .filter((c) => c.question.trim() && c.answer.trim())
    .map((c) => ({
      question: c.question.trim(),
      answer: c.answer.trim(),
    }));
}
