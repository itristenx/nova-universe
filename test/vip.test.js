import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVipWeight, calculateVipDueDate } from '../apps/api/utils/utils.js';

// helper to freeze time
const now = new Date('2024-01-01T00:00:00Z');

const EXEC_HOURS = 2;
const GOLD_HOURS = 4;
const DEFAULT_VIP_HOURS = 8;
const OVERRIDE_MINUTES = 15;

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
  assert.equal(execDue.toISOString(), new Date(now.getTime() + EXEC_HOURS * 60 * 60 * 1000).toISOString());

  const goldDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'gold' });
  assert.equal(goldDue.toISOString(), new Date(now.getTime() + GOLD_HOURS * 60 * 60 * 1000).toISOString());

  const defaultVipDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'priority' });
  assert.equal(defaultVipDue.toISOString(), new Date(now.getTime() + DEFAULT_VIP_HOURS * 60 * 60 * 1000).toISOString());

  const overrideDue = calculateVipDueDate('low', now, { is_vip: true, vip_level: 'priority', vip_sla_override: { responseMinutes: OVERRIDE_MINUTES } });
  assert.equal(overrideDue.toISOString(), new Date(now.getTime() + OVERRIDE_MINUTES * 60 * 1000).toISOString());
});
