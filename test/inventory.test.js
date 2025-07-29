import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { MigrationManager } from '../packages/database/database/migrations.js';
import { DatabaseFactory } from '../src/lib/db/index.js';
import { parseCsv } from '../apps/api/routes/inventory.js';

let db;

before(async () => {
  const mgr = new MigrationManager();
  await mgr.runMigrations();
  db = mgr.postgresql;
});

describe('Inventory CRUD', () => {
  it('should create, update and delete an asset', async () => {
    const res = await db.query('INSERT INTO inventory_assets (asset_tag) VALUES ($1) RETURNING id', ['TEST1']);
    const id = res.rows[0].id;
    assert.ok(id);
    await db.query('UPDATE inventory_assets SET asset_tag=$1 WHERE id=$2', ['TEST2', id]);
    const { rows } = await db.query('SELECT asset_tag FROM inventory_assets WHERE id=$1', [id]);
    assert.strictEqual(rows[0].asset_tag, 'TEST2');
    await db.query('DELETE FROM inventory_assets WHERE id=$1', [id]);
    const chk = await db.query('SELECT * FROM inventory_assets WHERE id=$1', [id]);
    assert.strictEqual(chk.rows.length, 0);
  });
});

describe('CSV import parser', () => {
  it('parses CSV text', () => {
    const csv = 'asset_tag,serial_number\nA1,S1\nA2,S2';
    const records = parseCsv(csv);
    assert.strictEqual(records.length, 2);
    assert.strictEqual(records[0].asset_tag, 'A1');
  });
});
