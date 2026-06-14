import { initializeMigrationQueue } from '../src/shared/migration/migration-queue';

function main() {
  console.log('🚀 Initializing Migration Queue...\n');
  
  try {
    initializeMigrationQueue();
    console.log(`\n✨ Migration queue initialized successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the migration queue`);
    console.log(`   2. Run automated fixer: npm run migration:fix`);
    console.log(`   3. Migrate features: npm run migration:migrate-feature`);
  } catch (error) {
    console.error('Migration queue initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as initMigrationQueue };
