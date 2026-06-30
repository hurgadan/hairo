import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUsers1751000100000 implements MigrationInterface {
  public name = "CreateUsers1751000100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "email", type: "varchar", isNullable: true },
          { name: "password_hash", type: "varchar", isNullable: true },
          { name: "telegram_id", type: "bigint", isNullable: true },
          { name: "telegram_username", type: "varchar", isNullable: true },
          { name: "first_name", type: "varchar", isNullable: true },
          { name: "last_name", type: "varchar", isNullable: true },
          { name: "locale", type: "varchar", default: "'ru'" },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "UQ_users_email",
        columnNames: ["email"],
        isUnique: true,
        where: `"email" IS NOT NULL`,
      }),
    );

    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "UQ_users_telegram_id",
        columnNames: ["telegram_id"],
        isUnique: true,
        where: `"telegram_id" IS NOT NULL`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "UQ_users_telegram_id");
    await queryRunner.dropIndex("users", "UQ_users_email");
    await queryRunner.dropTable("users", true);
  }
}
