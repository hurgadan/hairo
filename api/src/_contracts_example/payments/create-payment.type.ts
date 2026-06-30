import { PaymentType } from './payment-type.enum';

export interface CreatePayment {
  studentId: string;
  lessonsCount: number;
  type: PaymentType;
  comment?: string | null;
}
