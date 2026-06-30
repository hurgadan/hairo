import { Language } from './language.type';

export interface UpdateProfile {
  firstName?: string | null;
  lastName?: string | null;
  avatarData?: string | null;
  language?: Language;
  timezone?: string;
  bufferMinutesAfterLesson?: number;
}
