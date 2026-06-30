import { RecurringLessonSlot } from './recurring-lesson-slot.type';

export interface CreateRecurringLesson {
  studentId?: string;
  groupId?: string;
  duration: number;
  slots: RecurringLessonSlot[];
}
