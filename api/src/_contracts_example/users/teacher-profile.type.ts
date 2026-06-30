import { Language } from './language.type';
import { WorkSchedule } from './work-schedule.type';

export interface TeacherProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarData: string | null;
  language: Language;
  timezone: string;
  bufferMinutesAfterLesson: number;
  workSchedules: WorkSchedule[];
  createdAt: string;
  updatedAt: string;
}
