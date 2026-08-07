import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('Global Setup: Preparing SQLite test database...');

  // Set the environment variable so child processes use the test database
  process.env.DATABASE_URL = 'file:./prisma/test.db';

  // Ensure any existing test database is deleted to start fresh
  const dbPath = path.resolve(process.cwd(), 'prisma/test.db');
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log(`Existing test database deleted at ${dbPath}`);
    } catch (err) {
      console.error('Could not delete existing test database:', err);
    }
  }

  // Run database migration/push
  console.log('Running npx prisma db push --skip-generate...');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Run database seeding
  console.log('Running node prisma/seed.mjs...');
  execSync('node prisma/seed.mjs', {
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('Global Setup complete.');
}

export default globalSetup;
