import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddHairstyleIdToGenerations1751000500000 implements MigrationInterface {
  public name = "AddHairstyleIdToGenerations1751000500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "generations",
      new TableColumn({
        name: "hairstyle_id",
        type: "uuid",
        isNullable: false,
      }),
    );

    await queryRunner.createIndex(
      "generations",
      new TableIndex({
        name: "IDX_generations_hairstyle_id",
        columnNames: ["hairstyle_id"],
      }),
    );

    await queryRunner.createForeignKey(
      "generations",
      new TableForeignKey({
        name: "FK_generations_hairstyle_id",
        columnNames: ["hairstyle_id"],
        referencedTableName: "hairstyles",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "generations",
      "FK_generations_hairstyle_id",
    );
    await queryRunner.dropIndex("generations", "IDX_generations_hairstyle_id");
    await queryRunner.dropColumn("generations", "hairstyle_id");
  }
}
