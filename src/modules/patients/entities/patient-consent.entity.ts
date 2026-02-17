import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

export enum ConsentType {
  TREATMENT = 'treatment',
  DATA_SHARING = 'data_sharing',
  RESEARCH = 'research',
  MARKETING = 'marketing',
  TELEHEALTH = 'telehealth',
  PHOTOGRAPHY = 'photography',
  GENERAL = 'general',
}

export enum ConsentStatus {
  GRANTED = 'granted',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('patient_consents')
export class PatientConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @ManyToOne(() => Patient, (patient) => patient.consents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: ConsentType,
  })
  consent_type: ConsentType;

  @Column({
    type: 'enum',
    enum: ConsentStatus,
    default: ConsentStatus.PENDING,
  })
  status: ConsentStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  granted_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  granted_by: string; // Name or ID of patient/guardian who granted consent

  @Column({ type: 'varchar', length: 100, nullable: true })
  witnessed_by: string;

  @Column({ type: 'text', nullable: true })
  document_url: string; // Link to signed consent form

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
