import { Inject, Injectable } from '@nestjs/common';
import {
  type LessonRecord,
  STUDENTS_REPOSITORY,
  type StudentsRepository,
} from '../repositories/students.repository';

export interface GetStudentAgendaInput {
  studentId: string;
}

export interface AgendaLesson {
  startTime: string;
  endTime: string;
  subject: string;
}

export interface AgendaDay {
  date: string;
  lessons: AgendaLesson[];
}

// "HH:MM" e "YYYY-MM-DD" ordenam certo como texto.
const byStartTimeThenOrder = (a: LessonRecord, b: LessonRecord) =>
  a.startTime.localeCompare(b.startTime) || a.order - b.order;

@Injectable()
export class GetStudentAgendaUseCase {
  constructor(
    @Inject(STUDENTS_REPOSITORY)
    private readonly students: StudentsRepository,
  ) {}

  async execute({ studentId }: GetStudentAgendaInput): Promise<AgendaDay[]> {
    const days = await this.students.findAgendaDays(studentId);

    return days
      .toSorted((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        date: day.date,
        lessons: day.lessons
          .toSorted(byStartTimeThenOrder)
          .map(({ startTime, endTime, subject }) => ({
            startTime,
            endTime,
            subject,
          })),
      }));
  }
}
