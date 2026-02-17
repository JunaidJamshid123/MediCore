import { DataSource } from 'typeorm';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';

async function seedRolesAndPermissions() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const userRepository = dataSource.getRepository(User);

    // ===== CREATE PERMISSIONS =====
    console.log('\n📋 Creating permissions...');

    const permissionsData = [
      // Wildcard (Super Admin only)
      { resource: '*', action: '*', description: 'All permissions' },

      // User Management
      { resource: 'users', action: 'create', description: 'Create new users' },
      { resource: 'users', action: 'read', description: 'View all users' },
      { resource: 'users', action: 'update', description: 'Update users' },
      { resource: 'users', action: 'delete', description: 'Delete users' },
      { resource: 'users', action: 'manage', description: 'Full user management' },

      // Patient Management
      { resource: 'patients', action: 'create', description: 'Create patient records' },
      { resource: 'patients', action: 'read', description: 'View all patient records' },
      { resource: 'patients', action: 'read_own', description: 'View own patient record' },
      { resource: 'patients', action: 'update', description: 'Update patient records' },
      { resource: 'patients', action: 'delete', description: 'Delete patient records' },
      { resource: 'patients', action: 'manage_assigned', description: 'Manage assigned patients' },

      // Appointment Management
      { resource: 'appointments', action: 'create', description: 'Create appointments' },
      { resource: 'appointments', action: 'read', description: 'View all appointments' },
      { resource: 'appointments', action: 'read_own', description: 'View own appointments' },
      { resource: 'appointments', action: 'update', description: 'Update appointments' },
      { resource: 'appointments', action: 'delete', description: 'Cancel appointments' },
      { resource: 'appointments', action: 'manage_own', description: 'Manage own appointments' },

      // Medical Records
      { resource: 'medical_records', action: 'create', description: 'Create medical records' },
      { resource: 'medical_records', action: 'read', description: 'View medical records' },
      { resource: 'medical_records', action: 'read_own', description: 'View own medical records' },
      { resource: 'medical_records', action: 'update', description: 'Update medical records' },
      { resource: 'medical_records', action: 'delete', description: 'Delete medical records' },

      // Prescriptions
      { resource: 'prescriptions', action: 'create', description: 'Create prescriptions' },
      { resource: 'prescriptions', action: 'read', description: 'View prescriptions' },
      { resource: 'prescriptions', action: 'read_own', description: 'View own prescriptions' },
      { resource: 'prescriptions', action: 'update', description: 'Update prescriptions' },
      { resource: 'prescriptions', action: 'delete', description: 'Delete prescriptions' },

      // Reports
      { resource: 'reports', action: 'generate', description: 'Generate reports' },
      { resource: 'reports', action: 'read', description: 'View reports' },

      // Settings
      { resource: 'settings', action: 'read', description: 'View settings' },
      { resource: 'settings', action: 'update', description: 'Modify settings' },
    ];

    const permissions = [];
    for (const permData of permissionsData) {
      const code = `${permData.resource}:${permData.action}`;
      let permission = await permissionRepository.findOne({ where: { code } });

      if (!permission) {
        permission = permissionRepository.create({ ...permData, code });
        await permissionRepository.save(permission);
        console.log(`  ✓ Created permission: ${code}`);
      }

      permissions.push(permission);
    }

    // Helper function to get permissions by codes
    const getPermissionsByCode = async (codes: string[]) => {
      return await permissionRepository
        .createQueryBuilder('permission')
        .where('permission.code IN (:...codes)', { codes })
        .getMany();
    };

    // ===== CREATE ROLES =====
    console.log('\n👥 Creating roles...');

    const rolesData = [
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        is_system_role: true,
        permissionCodes: ['*:*'],
      },
      {
        name: 'Admin',
        description: 'Administrative access for user and system management',
        is_system_role: true,
        permissionCodes: [
          'users:*',
          'patients:read',
          'appointments:read',
          'medical_records:read',
          'prescriptions:read',
          'reports:generate',
          'reports:read',
          'settings:read',
          'settings:update',
        ],
      },
      {
        name: 'Doctor',
        description: 'Medical doctor with patient care permissions',
        is_system_role: true,
        permissionCodes: [
          'patients:read',
          'patients:update',
          'patients:manage_assigned',
          'appointments:read',
          'appointments:manage_own',
          'medical_records:create',
          'medical_records:read',
          'medical_records:update',
          'prescriptions:create',
          'prescriptions:read',
          'prescriptions:update',
          'reports:read',
        ],
      },
      {
        name: 'Nurse',
        description: 'Nursing staff with patient support permissions',
        is_system_role: true,
        permissionCodes: [
          'patients:read',
          'patients:update',
          'appointments:read',
          'appointments:update',
          'medical_records:read',
          'medical_records:update',
          'prescriptions:read',
        ],
      },
      {
        name: 'Patient',
        description: 'Patient with access to own records',
        is_system_role: true,
        permissionCodes: [
          'patients:read_own',
          'appointments:create',
          'appointments:read_own',
          'appointments:update',
          'medical_records:read_own',
          'prescriptions:read_own',
        ],
      },
      {
        name: 'Receptionist',
        description: 'Front desk staff for appointments and patient registration',
        is_system_role: true,
        permissionCodes: [
          'patients:create',
          'patients:read',
          'patients:update',
          'appointments:create',
          'appointments:read',
          'appointments:update',
          'appointments:delete',
        ],
      },
    ];

    const roles = [];
    for (const roleData of rolesData) {
      let role = await roleRepository.findOne({
        where: { name: roleData.name },
        relations: ['permissions'],
      });

      const rolePermissions = await getPermissionsByCode(
        roleData.permissionCodes,
      );

      if (!role) {
        role = roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          is_system_role: roleData.is_system_role,
          permissions: rolePermissions,
        });
        await roleRepository.save(role);
        console.log(`  ✓ Created role: ${roleData.name} with ${rolePermissions.length} permissions`);
      } else {
        role.permissions = rolePermissions;
        await roleRepository.save(role);
        console.log(`  ✓ Updated role: ${roleData.name}`);
      }

      roles.push(role);
    }

    // ===== MIGRATE EXISTING USERS TO NEW ROLE SYSTEM =====
    console.log('\n🔄 Migrating existing users to new role system...');

    const adminRole = roles.find((r) => r.name === 'Super Admin');
    const existingUsers = await userRepository.find();

    for (const user of existingUsers) {
      if (!user.role_id) {
        // Map old enum role to new role ID
        let targetRole = roles.find((r) => r.name === adminRole?.name);

        if (user.role === UserRole.ADMIN) {
          targetRole = roles.find((r) => r.name === 'Admin');
        } else if (user.role === UserRole.DOCTOR) {
          targetRole = roles.find((r) => r.name === 'Doctor');
        } else if (user.role === UserRole.NURSE) {
          targetRole = roles.find((r) => r.name === 'Nurse');
        } else if (user.role === UserRole.PATIENT) {
          targetRole = roles.find((r) => r.name === 'Patient');
        } else if (user.role === UserRole.RECEPTIONIST) {
          targetRole = roles.find((r) => r.name === 'Receptionist');
        }

        if (targetRole) {
          user.role_id = targetRole.id;
          await userRepository.save(user);
          console.log(`  ✓ Migrated user ${user.email} to role: ${targetRole.name}`);
        }
      }
    }

    // ===== CREATE DEFAULT ADMIN IF NOT EXISTS =====
    console.log('\n👤 Checking for default admin user...');

    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@medicore.com' },
    });

    if (!existingAdmin && adminRole) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);

      const adminUser = userRepository.create({
        email: 'admin@medicore.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        role_id: adminRole.id,
        first_name: 'System',
        last_name: 'Administrator',
        email_verified: true,
      });

      await userRepository.save(adminUser);
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@medicore.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('⚠️  Admin user already exists');
    }

    console.log('\n🎉 Roles and permissions seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Permissions: ${permissions.length}`);
    console.log(`   Roles: ${roles.length}`);
    console.log(`   Users migrated: ${existingUsers.length}`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    process.exit(1);
  }
}

seedRolesAndPermissions();
