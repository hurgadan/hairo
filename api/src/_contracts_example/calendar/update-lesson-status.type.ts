import { LessonStatus } from './lesson-status.type';

export interface UpdateLessonStatus {
  status: LessonStatus.COMPLETED | LessonStatus.CANCELLED;
}
