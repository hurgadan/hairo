import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateGenerations1751000400000 implements MigrationInterface {
  public name = "CreateGenerations1751000400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "generations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "user_id", type: "uuid" },
          { name: "photo_id", type: "uuid" },
          { name: "status", type: "varchar", default: "'pending'" },
          { name: "result_storage_key", type: "varchar", isNullable: true },
          { name: "result_content_type", type: "varchar", isNullable: true },
          { name: "error", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "generations",
      new TableIndex({
        name: "IDX_generations_user_id",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      "generations",
      new TableIndex({
        name: "IDX_generations_photo_id",
        columnNames: ["photo_id"],
      }),
    );

    await queryRunner.createForeignKey(
      "generations",
      new TableForeignKey({
        name: "FK_generations_user_id",
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "generations",
      new TableForeignKey({
        name: "FK_generations_photo_id",
        columnNames: ["photo_id"],
        referencedTableName: "photos",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("generations", "FK_generations_photo_id");
    await queryRunner.dropForeignKey("generations", "FK_generations_user_id");
    await queryRunner.dropIndex("generations", "IDX_generations_photo_id");
    await queryRunner.dropIndex("generations", "IDX_generations_user_id");
    await queryRunner.dropTable("generations", true);
  }
}
