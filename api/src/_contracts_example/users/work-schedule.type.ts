import { WorkInterval } from './work-interval.type';

export interface WorkSchedule {
  id: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  isWorkday: boolean;
  intervals: WorkInterval[];
}
