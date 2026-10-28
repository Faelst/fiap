import { z } from 'zod';

export const reportCardSummarySchema = z.object({
  year: z.number().int(),
  className: z.string(),
});

export const reportCardsSchema = z.array(reportCardSummarySchema);

export const subjectResultSchema = z.object({
  name: z.string(),
  /** `null` = ainda não lançada (a tela mostra `-`). */
  grade: z.number().min(0).max(10).nullable(),
  absences: z.number().int().min(0).nullable(),
});

export const termSchema = z.object({
  term: z.number().int().min(1),
  subjects: z.array(subjectResultSchema),
});

export const reportCardSchema = reportCardSummarySchema.extend({
  terms: z.array(termSchema),
});

export type ReportCardSummary = z.infer<typeof reportCardSummarySchema>;
export type SubjectResult = z.infer<typeof subjectResultSchema>;
export type Term = z.infer<typeof termSchema>;
export type ReportCard = z.infer<typeof reportCardSchema>;
