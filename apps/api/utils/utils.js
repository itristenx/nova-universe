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
    if (sla && sla.responseMinutes) {
      dueDate.setMinutes(now.getMinutes() + parseInt(sla.responseMinutes));
    } else {
      switch (vipRow.vip_level) {
        case 'exec':
          dueDate.setHours(now.getHours() + 2);
          break;
        case 'gold':
          dueDate.setHours(now.getHours() + 4);
          break;
        default:
          dueDate.setHours(now.getHours() + 8);
      }
    }
  }

  return dueDate;
}

