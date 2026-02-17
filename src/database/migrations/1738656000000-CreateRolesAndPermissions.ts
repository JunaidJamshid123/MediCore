import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesAndPermissions1738656000000
  implements MigrationInterface
{
  name = 'CreateRolesAndPermissions1738656000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "resource" VARCHAR(100) NOT NULL,
        "action" VARCHAR(50) NOT NULL,
        "code" VARCHAR(150) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_code" UNIQUE ("code")
      )
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "is_system_role" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);

    // Create role_permissions junction table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") 
          REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") 
          REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_role_id" ON "role_permissions" ("role_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_permissions_resource" ON "permissions" ("resource")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_permissions_action" ON "permissions" ("action")
    `);

    // Add role_id column to users table (will be populated in seed)
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "role_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_role" 
        FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_role_id" ON "users" ("role_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key and column from users
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_users_role_id"`);
    await queryRunner.query(`DROP INDEX "IDX_permissions_action"`);
    await queryRunner.query(`DROP INDEX "IDX_permissions_resource"`);
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_permission_id"`);
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_role_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
