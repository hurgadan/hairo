import { WorkInterval } from './work-interval.type';

export interface UpdateWorkScheduleItem {
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  isWorkday: boolean;
  intervals: WorkInterval[];
}

export interface UpdateWorkSchedule {
  schedules: UpdateWorkScheduleItem[];
}
