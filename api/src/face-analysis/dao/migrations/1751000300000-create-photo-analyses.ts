import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreatePhotoAnalyses1751000300000 implements MigrationInterface {
  public name = "CreatePhotoAnalyses1751000300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "photo_analyses",
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
          { name: "result", type: "jsonb", isNullable: true },
          { name: "error", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "photo_analyses",
      new TableIndex({
        name: "IDX_photo_analyses_user_id",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      "photo_analyses",
      new TableIndex({
        name: "IDX_photo_analyses_photo_id",
        columnNames: ["photo_id"],
      }),
    );

    await queryRunner.createForeignKey(
      "photo_analyses",
      new TableForeignKey({
        name: "FK_photo_analyses_user_id",
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "photo_analyses",
      new TableForeignKey({
        name: "FK_photo_analyses_photo_id",
        columnNames: ["photo_id"],
        referencedTableName: "photos",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "photo_analyses",
      "FK_photo_analyses_photo_id",
    );
    await queryRunner.dropForeignKey(
      "photo_analyses",
      "FK_photo_analyses_user_id",
    );
    await queryRunner.dropIndex(
      "photo_analyses",
      "IDX_photo_analyses_photo_id",
    );
    await queryRunner.dropIndex("photo_analyses", "IDX_photo_analyses_user_id");
    await queryRunner.dropTable("photo_analyses", true);
  }
}
