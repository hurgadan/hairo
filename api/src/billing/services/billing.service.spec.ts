import { HttpStatus } from "@nestjs/common";

import { CreditTransactionType } from "../../_contracts/billing/enums/transaction-type.enum";
import { GENERATION_COST_CREDITS, SIGNUP_BONUS_CREDITS } from "../constants";
import { InsufficientCreditsException } from "../exceptions/insufficient-credits.exception";
import { BillingRepository } from "../repositories/billing.repository";
import { BillingService } from "./billing.service";

describe("BillingService", () => {
  const repo = {
    getBalance: jest.fn(),
    findTransactions: jest.fn(),
    debit: jest.fn(),
    credit: jest.fn(),
  } as unknown as jest.Mocked<BillingRepository>;

  const buildService = (): BillingService => new BillingService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("grantSignupBonus", () => {
    it("credits the trial bonus to a new account", async () => {
      const service = buildService();

      await service.grantSignupBonus("user-1");

      expect(repo.credit).toHaveBeenCalledWith({
        userId: "user-1",
        amount: SIGNUP_BONUS_CREDITS,
        type: CreditTransactionType.SignupBonus,
      });
    });
  });

  describe("debitForGeneration", () => {
    it("debits the generation cost when the balance is sufficient", async () => {
      repo.debit.mockResolvedValue(true);
      const service = buildService();

      await service.debitForGeneration("user-1", "generation-1");

      expect(repo.debit).toHaveBeenCalledWith({
        userId: "user-1",
        amount: GENERATION_COST_CREDITS,
        type: CreditTransactionType.GenerationDebit,
        generationId: "generation-1",
      });
    });

    it("throws a 402 when the balance is insufficient", async () => {
      repo.debit.mockResolvedValue(false);
      const service = buildService();

      await expect(
        service.debitForGeneration("user-1", "generation-1"),
      ).rejects.toBeInstanceOf(InsufficientCreditsException);
      await expect(
        service.debitForGeneration("user-1", "generation-1"),
      ).rejects.toMatchObject({ status: HttpStatus.PAYMENT_REQUIRED });
    });
  });

  describe("refundForGeneration", () => {
    it("credits the generation cost back", async () => {
      const service = buildService();

      await service.refundForGeneration("user-1", "generation-1");

      expect(repo.credit).toHaveBeenCalledWith({
        userId: "user-1",
        amount: GENERATION_COST_CREDITS,
        type: CreditTransactionType.GenerationRefund,
        generationId: "generation-1",
      });
    });
  });

  describe("getBalance / getTransactions", () => {
    it("delegates to the repository", async () => {
      repo.getBalance.mockResolvedValue(3);
      repo.findTransactions.mockResolvedValue([]);
      const service = buildService();

      expect(await service.getBalance("user-1")).toBe(3);
      expect(await service.getTransactions("user-1")).toEqual([]);
      expect(repo.getBalance).toHaveBeenCalledWith("user-1");
      expect(repo.findTransactions).toHaveBeenCalledWith("user-1");
    });
  });
});
