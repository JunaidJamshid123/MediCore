import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@medicore.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin@123', 10);

      const adminUser = userRepository.create({
        email: 'admin@medicore.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        first_name: 'System',
        last_name: 'Administrator',
        email_verified: true,
      });

      await userRepository.save(adminUser);
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@medicore.com');
      console.log('   Password: Admin@123');
    }

    console.log('\n🎉 Database seeding completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
