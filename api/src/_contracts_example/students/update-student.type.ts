import { StudentStatus } from './student-status.type';
import { PaymentType } from '../payments';

export interface UpdateStudent {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  status?: StudentStatus;
  price?: number;
  duration?: number;
  paymentType?: PaymentType;
  paymentThresholdLessons?: number;
  startDate?: string | null;
  comment?: string | null;
}
