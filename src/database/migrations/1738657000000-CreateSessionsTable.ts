import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1738657000000 implements MigrationInterface {
  name = 'CreateSessionsTable1738657000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_sessions table
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "session_token" VARCHAR(500) NOT NULL,
        "device_info" VARCHAR(255),
        "ip_address" VARCHAR(45),
        "expires_at" TIMESTAMP NOT NULL,
        "last_activity_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_sessions_token" UNIQUE ("session_token"),
        CONSTRAINT "FK_user_sessions_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_user_id" ON "user_sessions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_token" ON "user_sessions" ("session_token")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_active" ON "user_sessions" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_expires" ON "user_sessions" ("expires_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_sessions_expires"`);
    await queryRunner.query(`DROP INDEX "IDX_user_sessions_active"`);
    await queryRunner.query(`DROP INDEX "IDX_user_sessions_token"`);
    await queryRunner.query(`DROP INDEX "IDX_user_sessions_user_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "user_sessions"`);
  }
}
