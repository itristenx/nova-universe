import db from './db.js';
import axios from 'axios';

export async function getConfig() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT key, value FROM config WHERE key LIKE 'directory%'",
      (err, rows) => {
        if (err) return reject(err);
        const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        resolve(cfg);
      }
    );
  });
}

export async function searchDirectory(q) {
  const cfg = await getConfig();
  if (cfg.directoryEnabled !== '1') return [];
  const provider = cfg.directoryProvider || 'mock';
  if (provider === 'scim') {
    const url = (cfg.directoryUrl || '').replace(/\/$/, '');
    const token = cfg.directoryToken || '';
    const resp = await axios.get(`${url}/Users`, {
      params: { filter: `userName co \"${q}\"` },
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = resp.data?.Resources || [];
    return list.map((u) => ({ name: u.displayName, email: u.userName }));
  }
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT settings FROM directory_integrations WHERE provider=?',
      [provider],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve([]);
        let arr = [];
        try {
          arr = JSON.parse(row.settings || '[]');
        } catch {}
        const ql = q.toLowerCase();
        resolve(
          arr.filter(
            (u) =>
              u.name.toLowerCase().includes(ql) ||
              (u.email && u.email.toLowerCase().includes(ql))
          )
        );
      }
    );
  });
}

export async function createUser(name, email) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}
