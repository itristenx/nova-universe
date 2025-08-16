export function _calculateVipWeight(isVip, vipLevel) {
  if (!isVip) return 0;
  if (isVip && (vipLevel === null || vipLevel === undefined)) {
    throw new Error("vipLevel must be provided when isVip is true");
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

