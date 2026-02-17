import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePatientManagement1739700000000 implements MigrationInterface {
  name = 'CreatePatientManagement1739700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // â”€â”€ Create enum types â”€â”€
    await queryRunner.query(`
      CREATE TYPE "patient_status_enum" AS ENUM ('active', 'inactive', 'deceased', 'transferred')
    `);
    await queryRunner.query(`
      CREATE TYPE "blood_type_enum" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    `);
    await queryRunner.query(`
      CREATE TYPE "marital_status_enum" AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated')
    `);
    await queryRunner.query(`
      CREATE TYPE "ethnicity_enum" AS ENUM ('caucasian', 'african_american', 'hispanic', 'asian', 'native_american', 'pacific_islander', 'multiracial', 'other', 'prefer_not_to_say')
    `);
    await queryRunner.query(`
      CREATE TYPE "emergency_contact_relationship_enum" AS ENUM ('spouse', 'parent', 'child', 'sibling', 'friend', 'guardian', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "insurance_type_enum" AS ENUM ('primary', 'secondary', 'tertiary')
    `);
    await queryRunner.query(`
      CREATE TYPE "family_relationship_enum" AS ENUM ('parent', 'child', 'sibling', 'spouse', 'grandparent', 'grandchild', 'uncle_aunt', 'nephew_niece', 'cousin', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "consent_type_enum" AS ENUM ('treatment', 'data_sharing', 'research', 'marketing', 'telehealth', 'photography', 'general')
    `);
    await queryRunner.query(`
      CREATE TYPE "consent_status_enum" AS ENUM ('granted', 'revoked', 'expired', 'pending')
    `);

    // â”€â”€ 1. Patients Table â”€â”€
    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: true, isUnique: true },
          { name: 'medical_record_number', type: 'varchar', length: '20', isUnique: true },
          { name: 'first_name', type: 'varchar', length: '100' },
          { name: 'last_name', type: 'varchar', length: '100' },
          { name: 'date_of_birth', type: 'date' },
          { name: 'gender', type: 'varchar', length: '10', isNullable: true },
          { name: 'marital_status', type: 'marital_status_enum', isNullable: true },
          { name: 'ethnicity', type: 'ethnicity_enum', isNullable: true },
          { name: 'preferred_language', type: 'varchar', length: '50', isNullable: true },
          { name: 'nationality', type: 'varchar', length: '100', isNullable: true },
          { name: 'ssn_encrypted', type: 'varchar', length: '500', isNullable: true },
          { name: 'ssn_last_four', type: 'varchar', length: '100', isNullable: true },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'secondary_phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_line_1', type: 'text', isNullable: true },
          { name: 'address_line_2', type: 'text', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'state', type: 'varchar', length: '100', isNullable: true },
          { name: 'zip_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'country', type: 'varchar', length: '100', isNullable: true },
          { name: 'blood_type', type: 'blood_type_enum', isNullable: true },
          { name: 'allergies', type: 'jsonb', isNullable: true, default: "'[]'" },
          { name: 'chronic_conditions', type: 'jsonb', isNullable: true, default: "'[]'" },
          { name: 'current_medications', type: 'text', isNullable: true },
          { name: 'height_cm', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'status', type: 'patient_status_enum', default: "'active'" },
          { name: 'primary_care_provider_id', type: 'uuid', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'registered_by', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Indexes for search optimization
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_mrn', columnNames: ['medical_record_number'], isUnique: true }));
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_name', columnNames: ['last_name', 'first_name'] }));
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_dob', columnNames: ['date_of_birth'] }));
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_phone', columnNames: ['phone'] }));
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_status', columnNames: ['status'] }));
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_provider', columnNames: ['primary_care_provider_id'] }));
    await queryRunner.createIndex('patients', new TableIndex({ name: 'IDX_patients_email', columnNames: ['email'] }));

    // Foreign keys
    await queryRunner.createForeignKey('patients', new TableForeignKey({
      name: 'FK_patients_user',
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    await queryRunner.createForeignKey('patients', new TableForeignKey({
      name: 'FK_patients_provider',
      columnNames: ['primary_care_provider_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    // â”€â”€ 2. Emergency Contacts Table â”€â”€
    await queryRunner.createTable(
      new Table({
        name: 'emergency_contacts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'patient_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'relationship', type: 'emergency_contact_relationship_enum' },
          { name: 'phone', type: 'varchar', length: '20' },
          { name: 'secondary_phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('emergency_contacts', new TableForeignKey({
      name: 'FK_emergency_contacts_patient',
      columnNames: ['patient_id'],
      referencedTableName: 'patients',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    // â”€â”€ 3. Insurance Info Table â”€â”€
    await queryRunner.createTable(
      new Table({
        name: 'insurance_info',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'patient_id', type: 'uuid' },
          { name: 'insurance_type', type: 'insurance_type_enum', default: "'primary'" },
          { name: 'provider_name', type: 'varchar', length: '200' },
          { name: 'policy_number', type: 'varchar', length: '100' },
          { name: 'group_number', type: 'varchar', length: '100', isNullable: true },
          { name: 'subscriber_name', type: 'varchar', length: '200', isNullable: true },
          { name: 'subscriber_relationship', type: 'varchar', length: '50', isNullable: true },
          { name: 'effective_date', type: 'date', isNullable: true },
          { name: 'expiration_date', type: 'date', isNullable: true },
          { name: 'copay_amount', type: 'varchar', length: '20', isNullable: true },
          { name: 'deductible_amount', type: 'varchar', length: '20', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('insurance_info', new TableForeignKey({
      name: 'FK_insurance_info_patient',
      columnNames: ['patient_id'],
      referencedTableName: 'patients',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    // â”€â”€ 4. Patient Relationships Table â”€â”€
    await queryRunner.createTable(
      new Table({
        name: 'patient_relationships',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'patient_id', type: 'uuid' },
          { name: 'related_patient_id', type: 'uuid', isNullable: true },
          { name: 'relationship_type', type: 'family_relationship_enum' },
          { name: 'related_person_name', type: 'varchar', length: '200', isNullable: true },
          { name: 'related_person_phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('patient_relationships', new TableForeignKey({
      name: 'FK_patient_relationships_patient',
      columnNames: ['patient_id'],
      referencedTableName: 'patients',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('patient_relationships', new TableForeignKey({
      name: 'FK_patient_relationships_related',
      columnNames: ['related_patient_id'],
      referencedTableName: 'patients',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    // â”€â”€ 5. Patient Consents Table â”€â”€
    await queryRunner.createTable(
      new Table({
        name: 'patient_consents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'patient_id', type: 'uuid' },
          { name: 'consent_type', type: 'consent_type_enum' },
          { name: 'status', type: 'consent_status_enum', default: "'pending'" },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'granted_at', type: 'timestamp' },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'revoked_at', type: 'timestamp', isNullable: true },
          { name: 'granted_by', type: 'varchar', length: '100', isNullable: true },
          { name: 'witnessed_by', type: 'varchar', length: '100', isNullable: true },
          { name: 'document_url', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('patient_consents', new TableForeignKey({
      name: 'FK_patient_consents_patient',
      columnNames: ['patient_id'],
      referencedTableName: 'patients',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respect foreign key constraints)
    await queryRunner.dropTable('patient_consents', true);
    await queryRunner.dropTable('patient_relationships', true);
    await queryRunner.dropTable('insurance_info', true);
    await queryRunner.dropTable('emergency_contacts', true);
    await queryRunner.dropTable('patients', true);

    // Drop enums
    await queryRunner.query('DROP TYPE IF EXISTS "consent_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "consent_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "family_relationship_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "insurance_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "emergency_contact_relationship_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "ethnicity_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "marital_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "blood_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "patient_status_enum"');
  }
}
