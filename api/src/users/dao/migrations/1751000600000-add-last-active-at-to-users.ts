import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLastActiveAtToUsers1751000600000 implements MigrationInterface {
  public name = "AddLastActiveAtToUsers1751000600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "last_active_at",
        type: "timestamp",
        default: "now()",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "last_active_at");
  }
}
