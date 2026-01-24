import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1737737000000 implements MigrationInterface {
  name = 'CreateUsersTable1737737000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('patient', 'doctor', 'nurse', 'admin', 'receptionist')
    `);

    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('active', 'inactive', 'suspended')
    `);

    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'other')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'patient',
        "status" "user_status_enum" NOT NULL DEFAULT 'active',
        "first_name" VARCHAR(100) NOT NULL,
        "last_name" VARCHAR(100) NOT NULL,
        "gender" "gender_enum",
        "date_of_birth" DATE,
        "profile_picture" VARCHAR(500),
        "phone" VARCHAR(20),
        "address" TEXT,
        "license_number" VARCHAR(100),
        "specialization" VARCHAR(200),
        "department" VARCHAR(100),
        "employee_id" VARCHAR(50),
        "medical_record_number" VARCHAR(50),
        "blood_type" VARCHAR(10),
        "allergies" TEXT,
        "last_login_at" TIMESTAMP,
        "password_changed_at" TIMESTAMP,
        "email_verified" BOOLEAN NOT NULL DEFAULT false,
        "refresh_token" VARCHAR(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_license_number" UNIQUE ("license_number"),
        CONSTRAINT "UQ_users_employee_id" UNIQUE ("employee_id"),
        CONSTRAINT "UQ_users_medical_record_number" UNIQUE ("medical_record_number")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "users" ("role")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_status" ON "users" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_users_status"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "gender_enum"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
