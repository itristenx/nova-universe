export function calculateVipWeight(isVip, vipLevel) {
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

export function calculateVipDueDate(priority, now, vipRow) {
  const dueDate = new Date(now);

  switch (priority) {
    case 'critical':
      dueDate.setHours(now.getHours() + 4);
      break;
    case 'high':
      dueDate.setDate(now.getDate() + 1);
      break;
    case 'medium':
      dueDate.setDate(now.getDate() + 3);
      break;
    default:
      dueDate.setDate(now.getDate() + 7);
  }

  if (vipRow?.is_vip) {
    const sla = vipRow.vip_sla_override || null;
    const vipDueDate = new Date(now); // Reset due date to current time for VIP users
    if (sla && sla.responseMinutes) {
      vipDueDate.setMinutes(now.getMinutes() + parseInt(sla.responseMinutes));
    } else {
      switch (vipRow.vip_level) {
        case 'exec':
          vipDueDate.setHours(now.getHours() + 2);
          break;
        case 'gold':
          vipDueDate.setHours(now.getHours() + 4);
          break;
        default:
          vipDueDate.setHours(now.getHours() + 8);
      }
    }
    return vipDueDate; // Return the VIP-specific due date
  }

  return dueDate;
}

