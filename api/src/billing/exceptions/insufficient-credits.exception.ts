import { HttpException, HttpStatus } from "@nestjs/common";

/** Недостаточно кредитов для операции → HTTP 402 Payment Required. */
export class InsufficientCreditsException extends HttpException {
  constructor() {
    super("Insufficient credits", HttpStatus.PAYMENT_REQUIRED);
  }
}
