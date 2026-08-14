import { HttpException, HttpStatus } from "@nestjs/common";

/** HTTP 429 — код запрашивают чаще, чем разрешено (антиспам ящика и перебор). */
export class TooManyOtpRequestsException extends HttpException {
  constructor(retryAfterSeconds: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: "Too many verification code requests",
        retryAfterSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
