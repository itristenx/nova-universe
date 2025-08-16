export function calculateVipWeight(isVip, vipLevel) {
  if (!isVip) return 0;
  if (isVip && (vipLevel === null || vipLevel === undefined)) {
    throw new Error('vipLevel must be provided when isVip is true');
  }
  switch (vipLevel) {
    case 'exec':
      return 3;
    case 'gold':
      return 2;
    default:
      return 1;
  }
}

/**
 * Validate and normalize a ticket type code
 */
export function normalizeTicketType(typeCode) {
  if (!typeCode || typeof typeCode !== 'string') {
    throw new Error('type is required');
  }
  const upper = typeCode.trim().toUpperCase();
  const allowed = new Set(['INC', 'REQ', 'PRB', 'CHG', 'TASK', 'HR', 'OPS', 'ISAC', 'FB']);
  if (!allowed.has(upper)) {
    throw new Error(`Unsupported ticket type: ${upper}`);
  }
  return upper;
}
