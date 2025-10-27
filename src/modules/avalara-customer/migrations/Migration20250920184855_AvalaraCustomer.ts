import { Migration } from "@mikro-orm/migrations";

export class Migration20250920184855_AvalaraCustomer extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "avalara_customer" ("id" text not null, "entity_use_code" text not null, "customer_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "avalara_customer_pkey" primary key ("id"));`
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
