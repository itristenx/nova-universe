import db from '../db.js';

/**
 * Fetch a configuration value from the database by key.
 * @param {string} key - The configuration key.
 * @returns {Promise<object>} - The configuration value.
 */
export const _fetchConfigByKey = (key) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT value FROM config WHERE key = $1';
    db.get(query, [key], (err, row) => {
      if (err) {
        return reject(new Error(`Database error: ${err.message}`));
      }
      if (!row) {
        return resolve(null);
      }
      try {
        const config = JSON.parse(row.value);
        resolve(config);
      } catch (parseError) {
        reject(new Error(`Invalid configuration format: ${parseError.message}`));
      }
    });
  });
};

/**
 * Delete a configuration by key.
 * @param {string} key - The configuration key.
 * @returns {Promise<number>} - The number of rows affected.
 */
export const _deleteConfigByKey = (key) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM config WHERE key = $1';
    db.run(query, [key], function (err) {
      if (err) {
        return reject(new Error(`Database error: ${err.message}`));
      }
      resolve(this.changes);
    });
  });
};
