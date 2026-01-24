import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  // 1. PRIMARY KEY
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 2. AUTHENTICATION & AUTHORIZATION
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
    nullable: false,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    nullable: false,
  })
  status: UserStatus;

  // 3. PERSONAL INFORMATION
  @Column({ type: 'varchar', length: 100, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_picture: string;

  // 4. CONTACT INFORMATION
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // 5. PROFESSIONAL FIELDS (Healthcare Providers Only)
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  license_number: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  specialization: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  employee_id: string;

  // 6. PATIENT FIELDS (Patients Only)
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  medical_record_number: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  blood_type: string;

  @Column({ type: 'text', nullable: true })
  allergies: string; // Store as JSON string

  // 7. SECURITY
  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at: Date;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @Exclude()
  refresh_token: string;

  // 8. AUDIT FIELDS
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  // Helper method to set password changed timestamp
  @BeforeInsert()
  setPasswordChangedAt() {
    this.password_changed_at = new Date();
  }
}
