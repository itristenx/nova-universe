/**
 * Role Constants - Predefined role IDs for Nova Universe
 * These IDs correspond to the default roles in the database seed data
 */

export const ROLES = {
  SUPERADMIN: 1,
  ADMIN: 2,
  USER: 3,
  KIOSK_OPERATOR: 4,
};

export const ROLE_NAMES = {
  [ROLES.SUPERADMIN]: 'superadmin',
  [ROLES.ADMIN]: 'admin',
  [ROLES.USER]: 'user',
  [ROLES.KIOSK_OPERATOR]: 'kiosk_operator',
};