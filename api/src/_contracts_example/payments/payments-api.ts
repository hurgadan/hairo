import { ApiBase } from '../api-base';
import { PaginatedResponse } from '../paginated-response.type';
import { CreatePayment } from './create-payment.type';
import { Payment } from './payment.type';

export abstract class PaymentsApi implements ApiBase {
  public readonly baseUrl = '/payments';

  protected abstract createPayment(data: CreatePayment): Promise<Payment>;
  protected abstract getPayments(params: {
    studentId?: string;
    groupId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>>;
}
