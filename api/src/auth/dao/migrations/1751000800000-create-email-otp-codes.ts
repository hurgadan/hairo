import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateEmailOtpCodes1751000800000 implements MigrationInterface {
  public name = "CreateEmailOtpCodes1751000800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "email_otp_codes",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "email", type: "varchar" },
          { name: "code_hash", type: "varchar" },
          { name: "attempts", type: "int", default: 0 },
          { name: "expires_at", type: "timestamp" },
          { name: "consumed_at", type: "timestamp", isNullable: true },
          { name: "request_ip", type: "varchar", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    // Оба индекса обслуживают и поиск активного кода, и оконный rate-limit.
    await queryRunner.createIndex(
      "email_otp_codes",
      new TableIndex({
        name: "IDX_email_otp_codes_email",
        columnNames: ["email"],
      }),
    );

    await queryRunner.createIndex(
      "email_otp_codes",
      new TableIndex({
        name: "IDX_email_otp_codes_request_ip",
        columnNames: ["request_ip"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "email_otp_codes",
      "IDX_email_otp_codes_request_ip",
    );
    await queryRunner.dropIndex("email_otp_codes", "IDX_email_otp_codes_email");
    await queryRunner.dropTable("email_otp_codes", true);
  }
}
