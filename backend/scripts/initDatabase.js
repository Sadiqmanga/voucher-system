import { initDatabase } from '../database/db.js';

console.log('Initializing database...');
initDatabase();
console.log('Database initialization complete!');
process.exit(0);

