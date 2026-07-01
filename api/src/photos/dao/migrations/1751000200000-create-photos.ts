import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreatePhotos1751000200000 implements MigrationInterface {
  public name = "CreatePhotos1751000200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "photos",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "user_id", type: "uuid" },
          { name: "storage_key", type: "varchar", isUnique: true },
          { name: "kind", type: "varchar", default: "'selfie'" },
          { name: "status", type: "varchar", default: "'uploaded'" },
          { name: "content_type", type: "varchar" },
          { name: "size_bytes", type: "int" },
          { name: "consent_at", type: "timestamp" },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "photos",
      new TableIndex({
        name: "IDX_photos_user_id",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createForeignKey(
      "photos",
      new TableForeignKey({
        name: "FK_photos_user_id",
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("photos", "FK_photos_user_id");
    await queryRunner.dropIndex("photos", "IDX_photos_user_id");
    await queryRunner.dropTable("photos", true);
  }
}
