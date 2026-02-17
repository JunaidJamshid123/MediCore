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

export enum InsuranceType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

@Entity('insurance_info')
export class InsuranceInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @ManyToOne(() => Patient, (patient) => patient.insurance_info, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: InsuranceType,
    default: InsuranceType.PRIMARY,
  })
  insurance_type: InsuranceType;

  @Column({ type: 'varchar', length: 200 })
  provider_name: string;

  @Column({ type: 'varchar', length: 100 })
  policy_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  group_number: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subscriber_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subscriber_relationship: string;

  @Column({ type: 'date', nullable: true })
  effective_date: Date;

  @Column({ type: 'date', nullable: true })
  expiration_date: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  copay_amount: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  deductible_amount: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
