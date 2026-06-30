import { PaymentType } from '../payments';

export interface CreateStudent {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  price: number;
  duration: number;
  paymentType?: PaymentType;
  paymentThresholdLessons?: number;
  startDate?: string | null;
  comment?: string | null;
}
