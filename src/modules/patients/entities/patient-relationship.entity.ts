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

export enum FamilyRelationship {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  UNCLE_AUNT = 'uncle_aunt',
  NEPHEW_NIECE = 'nephew_niece',
  COUSIN = 'cousin',
  OTHER = 'other',
}

@Entity('patient_relationships')
export class PatientRelationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @ManyToOne(() => Patient, (patient) => patient.relationships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // The related patient (can be null if not registered in the system)
  @Column({ type: 'uuid', nullable: true })
  related_patient_id: string;

  @ManyToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'related_patient_id' })
  related_patient: Patient;

  @Column({
    type: 'enum',
    enum: FamilyRelationship,
  })
  relationship_type: FamilyRelationship;

  // Name of the related person (for cases where they aren't a patient)
  @Column({ type: 'varchar', length: 200, nullable: true })
  related_person_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  related_person_phone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
