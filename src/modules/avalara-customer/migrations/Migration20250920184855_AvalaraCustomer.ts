import { Migration } from "@mikro-orm/migrations";

export class Migration20250920184855_AvalaraCustomer extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `CREATE TABLE IF NOT EXISTS "avalara_customer" ("id" TEXT NOT NULL, "entity_use_code" TEXT NOT NULL, "customer_id" TEXT NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "deleted_at" TIMESTAMPTZ NULL, CONSTRAINT "avalara_customer_pkey" PRIMARY KEY ("id"));`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_avalara_customer_customer_id" ON "avalara_customer" (customer_id) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_avalara_customer_deleted_at" ON "avalara_customer" (deleted_at) WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_avalara_customer_customer_id_active" ON "avalara_customer" (customer_id) WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `DROP INDEX IF EXISTS "UQ_avalara_customer_customer_id_active";`
    );
    this.addSql(`DROP INDEX IF EXISTS "IDX_avalara_customer_deleted_at";`);
    this.addSql(`DROP INDEX IF EXISTS "IDX_avalara_customer_customer_id";`);
    this.addSql(`drop table if exists "avalara_customer" cascade;`);
  }
}
