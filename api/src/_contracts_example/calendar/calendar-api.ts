import { ApiBase } from '../api-base';
import { PaginatedResponse } from '../paginated-response.type';
import { AvailableSlot } from './available-slot.type';
import { CreateLesson } from './create-lesson.type';
import { CreateRecurringLesson } from './create-recurring-lesson.type';
import { Lesson } from './lesson.type';
import { UpdateLessonStatus } from './update-lesson-status.type';

export abstract class CalendarApi implements ApiBase {
  public readonly baseUrl = '/calendar';

  protected abstract getWeek(startDate?: string): Promise<Lesson[]>;
  protected abstract getAvailableSlots(
    startDate: string,
    duration: number,
  ): Promise<AvailableSlot[]>;
  protected abstract createRecurringLesson(data: CreateRecurringLesson): Promise<Lesson[]>;
  protected abstract createLesson(data: CreateLesson): Promise<Lesson>;
  protected abstract getLessons(params: {
    studentId?: string;
    groupId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Lesson>>;
  protected abstract updateLessonStatus(id: string, data: UpdateLessonStatus): Promise<Lesson>;
}
