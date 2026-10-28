import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export const lessonSchema = z.object({
  startTime: z.string().regex(TIME),
  endTime: z.string().regex(TIME),
  subject: z.string(),
});

export const agendaDaySchema = z.object({
  /** Data local `AAAA-MM-DD`; leia com `parseLocalDate`, nunca `new Date()`. */
  date: z.string().regex(ISO_DATE),
  lessons: z.array(lessonSchema),
});

export const agendaSchema = z.array(agendaDaySchema);

export type Lesson = z.infer<typeof lessonSchema>;
export type AgendaDay = z.infer<typeof agendaDaySchema>;
export type Agenda = z.infer<typeof agendaSchema>;
