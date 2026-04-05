import 'dotenv/config';
import seedTestData from './seed';

// Run seed when executed
seedTestData().catch((error) => {
  console.error('Failed to seed data:', error);
  process.exit(1);
});
