import { DataSource } from 'typeorm';
import dataSource from '../data-source';

async function markMigrationComplete() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Insert migration record
    await dataSource.query(`
      INSERT INTO migrations (timestamp, name) 
      VALUES (1737737000000, 'CreateUsersTable1737737000000')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ CreateUsersTable migration marked as complete');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

markMigrationComplete();
