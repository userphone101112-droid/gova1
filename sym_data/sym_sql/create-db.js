// Create SQLite database from schema
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'allusers.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Delete existing database if it exists
if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Old database deleted');
}

// Create new database
const db = new Database(DB_PATH);

// Read and execute schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

// Execute entire schema at once
try {
    db.exec(schema);
    console.log('Schema executed successfully');
} catch (error) {
    console.error('Error executing schema:', error);
    process.exit(1);
}

// Insert sample data
const insertSample = db.prepare(`
    INSERT INTO users (uid, phone, password, last_login_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
`);

// Generate sample user using our utility
const sampleUsers = [
    {
        uid: 'usr_' + Math.random().toString(36).substring(2, 15),
        phone: '01012345678',
        password: 'hashed_password_123',
        last_login_at: new Date().toISOString()
    },
    {
        uid: 'usr_' + Math.random().toString(36).substring(2, 15),
        phone: '01287654321',
        password: 'hashed_password_456',
        last_login_at: null
    }
];

sampleUsers.forEach((user) => {
    const now = new Date().toISOString();
    insertSample.run(
        user.uid,
        user.phone,
        user.password,
        user.last_login_at,
        now,
        now
    );
    console.log(`Inserted sample user: ${user.phone}`);
});

console.log('Database created successfully!');
console.log(`Location: ${DB_PATH}`);

// Verify
const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`Total users: ${count.count}`);

db.close();
