export interface StudentBalance {
  studentId: string;
  totalPaid: number;
  totalCharged: number;
  balance: number;
  paidLessonsCount: number;
  unpaidLessons: number;
  isOverdue: boolean;
}
