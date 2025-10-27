import { Migration } from "@mikro-orm/migrations";

export class Migration20250920184854_AvalaraProduct extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `CREATE TABLE IF NOT EXISTS "avalara_product" ("id" TEXT NOT NULL, "tax_code" TEXT NOT NULL, "product_id" TEXT NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "deleted_at" TIMESTAMPTZ NULL, CONSTRAINT "avalara_product_pkey" PRIMARY KEY ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_avalara_product_product_id" ON "avalara_product" (product_id) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_avalara_product_deleted_at" ON "avalara_product" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_avalara_product_product_id_active" ON "avalara_product" (product_id) WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "avalara_product" CASCADE;`);
  }
}
