import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BillingController } from "./controllers/billing.controller";
import { CreditBalance } from "./dao/credit-balance.entity";
import { CreditTransaction } from "./dao/credit-transaction.entity";
import { BillingRepository } from "./repositories/billing.repository";
import { BillingService } from "./services/billing.service";

@Module({
  imports: [TypeOrmModule.forFeature([CreditBalance, CreditTransaction])],
  controllers: [BillingController],
  providers: [BillingRepository, BillingService],
  exports: [BillingService],
})
export class BillingModule {}
