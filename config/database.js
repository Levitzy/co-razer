const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'co_razer_db';

    client = new MongoClient(mongoUri);
    await client.connect();
    
    db = client.db(dbName);
    console.log(`✓ Connected to MongoDB database: ${dbName}`);
    
    // Create indexes for users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function closeDatabase() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('✓ MongoDB connection closed');
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

module.exports = {
  connectToDatabase,
  closeDatabase,
  getDatabase
};

