import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateBilling1751000700000 implements MigrationInterface {
  public name = "CreateBilling1751000700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "credit_balances",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "user_id", type: "uuid" },
          { name: "balance", type: "int", default: 0 },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "credit_balances",
      new TableIndex({
        name: "UQ_credit_balances_user_id",
        columnNames: ["user_id"],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      "credit_balances",
      new TableForeignKey({
        name: "FK_credit_balances_user_id",
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "credit_transactions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "user_id", type: "uuid" },
          { name: "amount", type: "int" },
          { name: "type", type: "varchar" },
          { name: "reason", type: "varchar", isNullable: true },
          { name: "generation_id", type: "uuid", isNullable: true },
          { name: "stripe_event_id", type: "varchar", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "credit_transactions",
      new TableIndex({
        name: "IDX_credit_transactions_user_id",
        columnNames: ["user_id"],
      }),
    );

    // Идемпотентность Stripe-вебхука: один event начисляет ровно один раз.
    await queryRunner.createIndex(
      "credit_transactions",
      new TableIndex({
        name: "UQ_credit_transactions_stripe_event_id",
        columnNames: ["stripe_event_id"],
        isUnique: true,
        where: "stripe_event_id IS NOT NULL",
      }),
    );

    await queryRunner.createForeignKey(
      "credit_transactions",
      new TableForeignKey({
        name: "FK_credit_transactions_user_id",
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "credit_transactions",
      "FK_credit_transactions_user_id",
    );
    await queryRunner.dropIndex(
      "credit_transactions",
      "UQ_credit_transactions_stripe_event_id",
    );
    await queryRunner.dropIndex(
      "credit_transactions",
      "IDX_credit_transactions_user_id",
    );
    await queryRunner.dropTable("credit_transactions", true);

    await queryRunner.dropForeignKey(
      "credit_balances",
      "FK_credit_balances_user_id",
    );
    await queryRunner.dropIndex(
      "credit_balances",
      "UQ_credit_balances_user_id",
    );
    await queryRunner.dropTable("credit_balances", true);
  }
}
