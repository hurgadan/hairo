import { PaymentType } from './payment-type.enum';

export interface Payment {
  id: string;
  teacherId: string;
  studentId: string | null;
  groupId: string | null;
  amount: number;
  lessonsCount: number;
  type: PaymentType;
  comment: string | null;
  createdAt: string;
}
