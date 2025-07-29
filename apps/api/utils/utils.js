export function calculateVipWeight(isVip, vipLevel) {
  if (!isVip) return 0;
  switch (vipLevel) {
    case 'exec':
      return 3;
    case 'gold':
      return 2;
    default:
      return 1;
  }
}

