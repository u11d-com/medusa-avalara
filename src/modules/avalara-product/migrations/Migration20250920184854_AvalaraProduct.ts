import { Migration } from "@mikro-orm/migrations";

export class Migration20250920184854_AvalaraProduct extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "avalara_product" ("id" text not null, "tax_code" text not null, "product_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "avalara_product_pkey" primary key ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_avalara_product_id" ON "avalara_product" (product_id) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_avalara_product_deleted_at" ON "avalara_product" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_avalara_product_id_active" ON "avalara_product" (product_id) WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "avalara_product" cascade;`);
  }
}
