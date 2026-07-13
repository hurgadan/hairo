import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";

import { UsersService } from "../services/users.service";
import { TouchActivityInterceptor } from "./touch-activity.interceptor";

describe("TouchActivityInterceptor", () => {
  const users = {
    touchActivity: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  const next: jest.Mocked<CallHandler> = {
    handle: jest.fn().mockReturnValue(of("response")),
  };

  function buildContext(user?: { userId: string }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    users.touchActivity.mockResolvedValue(undefined);
  });

  it("touches activity when the request is authenticated", (done) => {
    const interceptor = new TouchActivityInterceptor(users);

    interceptor
      .intercept(buildContext({ userId: "user-1" }), next)
      .subscribe(() => {
        expect(users.touchActivity).toHaveBeenCalledWith("user-1");
        done();
      });
  });

  it("does nothing when the request is unauthenticated", (done) => {
    const interceptor = new TouchActivityInterceptor(users);

    interceptor.intercept(buildContext(undefined), next).subscribe(() => {
      expect(users.touchActivity).not.toHaveBeenCalled();
      done();
    });
  });

  it("does not fail the request if touching activity rejects", (done) => {
    users.touchActivity.mockRejectedValue(new Error("db down"));
    const interceptor = new TouchActivityInterceptor(users);

    interceptor
      .intercept(buildContext({ userId: "user-1" }), next)
      .subscribe((value) => {
        expect(value).toBe("response");
        done();
      });
  });
});
