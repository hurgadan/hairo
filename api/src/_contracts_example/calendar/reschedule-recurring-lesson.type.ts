export interface RescheduleRecurringLesson {
  cancelFrom: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  studentId?: string;
  groupId?: string;
}
