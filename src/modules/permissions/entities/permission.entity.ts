import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  resource: string; // 'users', 'patients', 'appointments', 'prescriptions'

  @Column({ type: 'varchar', length: 50, nullable: false })
  action: string; // 'create', 'read', 'update', 'delete', 'manage', 'read_own'

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  code: string; // 'users:create', 'patients:read', 'appointments:manage_own'

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
