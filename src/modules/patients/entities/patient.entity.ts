import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { EmergencyContact } from './emergency-contact.entity';
import { InsuranceInfo } from './insurance-info.entity';
import { PatientRelationship } from './patient-relationship.entity';
import { PatientConsent } from './patient-consent.entity';

export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  TRANSFERRED = 'transferred',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
}

export enum Ethnicity {
  CAUCASIAN = 'caucasian',
  AFRICAN_AMERICAN = 'african_american',
  HISPANIC = 'hispanic',
  ASIAN = 'asian',
  NATIVE_AMERICAN = 'native_american',
  PACIFIC_ISLANDER = 'pacific_islander',
  MULTIRACIAL = 'multiracial',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity('patients')
@Index(['medical_record_number'], { unique: true })
@Index(['last_name', 'first_name'])
@Index(['date_of_birth'])
@Index(['phone'])
@Index(['status'])
@Index(['primary_care_provider_id'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // â”€â”€ Link to User account â”€â”€
  @Column({ type: 'uuid', unique: true, nullable: true })
  user_id: string;

  @OneToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // â”€â”€ Medical Record Number (auto-generated) â”€â”€
  @Column({ type: 'varchar', length: 20, unique: true })
  medical_record_number: string;

  // â”€â”€ Demographics â”€â”€
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    nullable: true,
  })
  marital_status: MaritalStatus;

  @Column({
    type: 'enum',
    enum: Ethnicity,
    nullable: true,
  })
  ethnicity: Ethnicity;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferred_language: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  // â”€â”€ Sensitive Data (encrypted at rest) â”€â”€
  @Column({ type: 'varchar', length: 500, nullable: true })
  @Exclude()
  ssn_encrypted: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ssn_last_four: string; // Last 4 digits for display/search

  // â”€â”€ Contact Information â”€â”€
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  secondary_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address_line_1: string;

  @Column({ type: 'text', nullable: true })
  address_line_2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zip_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  // â”€â”€ Medical Information â”€â”€
  @Column({
    type: 'enum',
    enum: BloodType,
    nullable: true,
  })
  blood_type: BloodType;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  allergies: string[];

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  chronic_conditions: string[];

  @Column({ type: 'text', nullable: true })
  current_medications: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg: number;

  // â”€â”€ Status â”€â”€
  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  // â”€â”€ Primary Care Provider (Doctor) â”€â”€
  @Column({ type: 'uuid', nullable: true })
  primary_care_provider_id: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'primary_care_provider_id' })
  primary_care_provider: User;

  // â”€â”€ Relationships â”€â”€
  @OneToMany(() => EmergencyContact, (ec) => ec.patient, {
    cascade: true,
    eager: false,
  })
  emergency_contacts: EmergencyContact[];

  @OneToMany(() => InsuranceInfo, (ins) => ins.patient, {
    cascade: true,
    eager: false,
  })
  insurance_info: InsuranceInfo[];

  @OneToMany(() => PatientRelationship, (rel) => rel.patient, {
    cascade: true,
    eager: false,
  })
  relationships: PatientRelationship[];

  @OneToMany(() => PatientConsent, (consent) => consent.patient, {
    cascade: true,
    eager: false,
  })
  consents: PatientConsent[];

  // â”€â”€ Notes â”€â”€
  @Column({ type: 'text', nullable: true })
  notes: string;

  // â”€â”€ Audit Fields â”€â”€
  @Column({ type: 'uuid', nullable: true })
  registered_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
