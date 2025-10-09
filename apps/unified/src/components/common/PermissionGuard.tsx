/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions or roles.
 * Provides a convenient way to hide UI elements from unauthorized users.
 * 
 * @example
 * ```tsx
 * import { PermissionGuard } from '@components/common/PermissionGuard';
 * 
 * // Hide button if user doesn't have permission
 * <PermissionGuard permission="users:delete">
 *   <button>Delete User</button>
 * </PermissionGuard>
 * 
 * // Hide button if user doesn't have role
 * <PermissionGuard role="Admin">
 *   <button>Admin Settings</button>
 * </PermissionGuard>
 * 
 * // Show fallback UI if unauthorized
 * <PermissionGuard 
 *   role="Approver"
 *   fallback={<DisabledButton tooltip="Contact admin for approver access" />}
 * >
 *   <button>Approve</button>
 * </PermissionGuard>
 * ```
 */

import { ReactNode } from 'react';
import { usePermission, useRole, useAnyRole, useAllRoles } from '@hooks/usePermission';

export interface PermissionGuardProps {
  /** Children to render if permission check passes */
  children: ReactNode;
  
  /** Single permission to check (e.g., 'users:delete') */
  permission?: string;
  
  /** Single role to check (e.g., 'Admin') */
  role?: string;
  
  /** Array of roles - user must have at least one (OR logic) */
  anyRole?: string[];
  
  /** Array of roles - user must have all (AND logic) */
  allRoles?: string[];
  
  /** Element to render if permission check fails (default: null) */
  fallback?: ReactNode;
  
  /** Invert the check - render if user does NOT have permission/role */
  invert?: boolean;
}

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions or roles.
 * Supports multiple check modes:
 * - permission: Check single permission
 * - role: Check single role
 * - anyRole: Check if user has any of the specified roles (OR)
 * - allRoles: Check if user has all of the specified roles (AND)
 * 
 * Priority order (if multiple checks specified):
 * 1. permission
 * 2. role
 * 3. anyRole
 * 4. allRoles
 * 
 * @param props - PermissionGuardProps
 * @returns React element or null
 */
export function PermissionGuard({
  children,
  permission,
  role,
  anyRole,
  allRoles,
  fallback = null,
  invert = false,
}: PermissionGuardProps) {
  // Hook calls must be unconditional
  const hasPermission = usePermission(permission || '');
  const hasRole = useRole(role || '');
  const hasAnyRole = useAnyRole(anyRole || []);
  const hasAllRoles = useAllRoles(allRoles || []);
  
  // Determine which check to use (priority order)
  let checkPassed = false;
  
  if (permission) {
    checkPassed = hasPermission;
  } else if (role) {
    checkPassed = hasRole;
  } else if (anyRole && anyRole.length > 0) {
    checkPassed = hasAnyRole;
  } else if (allRoles && allRoles.length > 0) {
    checkPassed = hasAllRoles;
  } else {
    // No check specified, render children by default
    checkPassed = true;
  }
  
  // Invert the check if requested
  if (invert) {
    checkPassed = !checkPassed;
  }
  
  // Render children if check passed, otherwise render fallback
  return checkPassed ? <>{children}</> : <>{fallback}</>;
}

/**
 * AdminOnly Component
 * 
 * Convenience wrapper for PermissionGuard that checks for Admin or SuperAdmin roles.
 * 
 * @example
 * ```tsx
 * <AdminOnly>
 *   <button>Delete All Users</button>
 * </AdminOnly>
 * ```
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard anyRole={['Admin', 'SuperAdmin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * ApproverOnly Component
 * 
 * Convenience wrapper for PermissionGuard that checks for Approver roles.
 * 
 * @example
 * ```tsx
 * <ApproverOnly>
 *   <button>Approve Request</button>
 * </ApproverOnly>
 * ```
 */
export function ApproverOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard anyRole={['Approver', 'Approval Admin', 'Admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * WorkflowAdminOnly Component
 * 
 * Convenience wrapper for PermissionGuard that checks for Workflow Admin roles.
 * 
 * @example
 * ```tsx
 * <WorkflowAdminOnly>
 *   <button>Publish Workflow</button>
 * </WorkflowAdminOnly>
 * ```
 */
export function WorkflowAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard anyRole={['Workflow Admin', 'Admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * CatalogAdminOnly Component
 * 
 * Convenience wrapper for PermissionGuard that checks for Catalog Admin roles.
 * 
 * @example
 * ```tsx
 * <CatalogAdminOnly>
 *   <button>Create Service</button>
 * </CatalogAdminOnly>
 * ```
 */
export function CatalogAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard anyRole={['Catalog Admin', 'Admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * ReadOnly Component
 * 
 * Renders children ONLY for non-admin users (inverted check).
 * Useful for showing read-only messages.
 * 
 * @example
 * ```tsx
 * <ReadOnly>
 *   <div className="text-gray-500">
 *     You have read-only access. Contact admin to request edit permissions.
 *   </div>
 * </ReadOnly>
 * ```
 */
export function ReadOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard anyRole={['Admin', 'SuperAdmin']} invert fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
