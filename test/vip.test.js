import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVipWeight, calculateVipDueDate } from '../apps/api/utils/utils.js';

// helper to freeze time
const now = new Date('2024-01-01T00:00:00Z');

test('calculateVipWeight returns expected values', () => {
  assert.equal(calculateVipWeight(false), 0);
  assert.equal(calculateVipWeight(true, 'priority'), 1);
  assert.equal(calculateVipWeight(true, 'gold'), 2);
  assert.equal(calculateVipWeight(true, 'exec'), 3);
});

test('VIP due date respects level and overrides', () => {
  const base = calculateVipDueDate('low', now, null);
  assert.equal(base.toISOString(), new Date('2024-01-08T00:00:00.000Z').toISOString());

  const execDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'exec' });
  assert.equal(execDue.toISOString(), new Date(new Date(now).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const goldDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'gold' });
  assert.equal(goldDue.toISOString(), new Date(new Date(now).getTime() + 4 * 60 * 60 * 1000).toISOString());

  const defaultVipDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'priority' });
  assert.equal(defaultVipDue.toISOString(), new Date(new Date(now).getTime() + 8 * 60 * 60 * 1000).toISOString());

  const overrideDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'priority', vip_sla_override: { responseMinutes: 15 } });
  assert.equal(overrideDue.toISOString(), new Date(new Date(now).getTime() + 15 * 60 * 1000).toISOString());
});
