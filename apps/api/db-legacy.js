// This file previously provided legacy SQLite support. SQLite is now fully removed from the codebase.
// If this file is imported, throw an error to prevent accidental usage.

throw new Error('db-legacy.js: SQLite support has been removed. Use PostgreSQL or MongoDB only.');
