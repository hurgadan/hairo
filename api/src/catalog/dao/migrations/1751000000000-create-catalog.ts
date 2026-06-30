import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCatalog1751000000000 implements MigrationInterface {
  public name = "CreateCatalog1751000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "hairstyles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "slug", type: "varchar", isUnique: true },
          { name: "name", type: "jsonb" },
          { name: "description", type: "jsonb", isNullable: true },
          { name: "group_name", type: "varchar" },
          { name: "length", type: "varchar" },
          { name: "silhouette", type: "varchar", isNullable: true },
          { name: "gender_presentation", type: "varchar" },
          { name: "fringe", type: "varchar", isNullable: true },
          { name: "layering", type: "varchar", isNullable: true },
          { name: "parting", type: "varchar", isNullable: true },
          { name: "volume", type: "varchar", isNullable: true },
          { name: "era", type: "varchar", isNullable: true },
          { name: "maintenance", type: "varchar" },
          { name: "texture", type: "text", isArray: true, default: "'{}'" },
          { name: "finish", type: "text", isArray: true, default: "'{}'" },
          { name: "aesthetic", type: "text", isArray: true, default: "'{}'" },
          { name: "occasion", type: "text", isArray: true, default: "'{}'" },
          {
            name: "flatters_face_shapes",
            type: "text",
            isArray: true,
            default: "'{}'",
          },
          {
            name: "works_on_textures",
            type: "text",
            isArray: true,
            default: "'{}'",
          },
          {
            name: "suits_hair_density",
            type: "text",
            isArray: true,
            default: "'{}'",
          },
          { name: "hairstyle_fragment", type: "text" },
          { name: "preview_image", type: "varchar", isNullable: true },
          { name: "reference_image", type: "varchar", isNullable: true },
          { name: "is_active", type: "boolean", default: true },
          { name: "sort_order", type: "integer", default: 0 },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "color_options",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "slug", type: "varchar", isUnique: true },
          { name: "name", type: "jsonb" },
          { name: "family", type: "varchar" },
          { name: "level", type: "integer", isNullable: true },
          { name: "technique", type: "varchar" },
          { name: "hex_swatch", type: "varchar", isNullable: true },
          { name: "prompt_fragment", type: "text" },
          { name: "is_active", type: "boolean", default: true },
          { name: "sort_order", type: "integer", default: 0 },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("color_options", true);
    await queryRunner.dropTable("hairstyles", true);
  }
}
