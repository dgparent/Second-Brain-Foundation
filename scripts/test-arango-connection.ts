/**
 * Test ArangoDB Connection
 * 
 * Run: npm run test:arango
 */

import { Database } from 'arangojs';

const config = {
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  database: process.env.ARANGO_DATABASE || 'sbf_knowledge',
  username: process.env.ARANGO_USERNAME || 'root',
  password: process.env.ARANGO_PASSWORD || 'sbf_development',
};

async function testConnection() {
  console.log('🔍 Testing ArangoDB Connection...\n');
  console.log('Config:', {
    url: config.url,
    database: config.database,
    username: config.username,
  });

  try {
    // Create database instance
    const db = new Database({
      url: config.url,
      auth: { 
        username: config.username, 
        password: config.password 
      },
    });

    // Test connection to _system database
    const version = await db.version();
    console.log('\n✅ Connected to ArangoDB');
    console.log('   Version:', version.version);
    console.log('   Server:', version.server);

    // List databases
    const databases = await db.listDatabases();
    console.log('\n📊 Available Databases:', databases);

    // Check if our database exists
    if (!databases.includes(config.database)) {
      console.log(`\n⚠️  Database "${config.database}" not found`);
      console.log('   Creating database...');
      await db.createDatabase(config.database);
      console.log('   ✅ Database created');
    }

    // Switch to our database
    const sbfDb = db.database(config.database);
    
    // List collections
    const collections = await sbfDb.listCollections();
    console.log('\n📚 Collections in', config.database + ':');
    collections.forEach(col => {
      console.log(`   - ${col.name} (${col.type === 2 ? 'document' : 'edge'})`);
    });

    console.log('\n✅ All tests passed!');
    console.log('\n🎉 ArangoDB is ready for SBF Memory Engine');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure ArangoDB is running: docker ps');
    console.error('2. Check credentials in .env file or environment variables');
    console.error('3. Verify port 8529 is accessible');
    process.exit(1);
  }
}

// Run test
testConnection();
