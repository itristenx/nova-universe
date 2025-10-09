/**
 * Permission and Role Hooks
 * 
 * Provides React hooks for checking user permissions and roles in components.
 * These hooks integrate with the auth store to provide real-time permission checks.
 * 
 * @example
 * ```tsx
 * import { usePermission, useRole, useRoles } from '@hooks/usePermission';
 * 
 * function MyComponent() {
 *   const canDelete = usePermission('users:delete');
 *   const isAdmin = useRole('Admin');
 *   const { isAdmin, isApprover } = useRoles();
 *   
 *   return (
 *     <>
 *       {isAdmin && <button>Delete</button>}
 *       {canDelete && <button>Delete</button>}
 *     </>
 *   );
 * }
 * ```
 */

import { useAuthStore } from '@stores/auth';
import type { User } from '@/types';

/**
 * Check if the current user has a specific permission
 * 
 * @param permission - Permission name to check (e.g., 'users:delete', 'workflows:create')
 * @returns boolean - true if user has the permission
 * 
 * @example
 * ```tsx
 * const canCreateWorkflow = usePermission('workflows:create');
 * if (canCreateWorkflow) {
 *   // Show create button
 * }
 * ```
 */
export function usePermission(permission: string): boolean {
  const { user } = useAuthStore();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  // Check if user has the specific permission
  return user.permissions.some((p) => p.name === permission || p.id === permission);
}

/**
 * Check if the current user has a specific role
 * 
 * @param roleName - Role name to check (e.g., 'Admin', 'Approver')
 * @returns boolean - true if user has the role
 * 
 * @example
 * ```tsx
 * const isApprover = useRole('Approver');
 * if (isApprover) {
 *   // Show approve button
 * }
 * ```
 */
export function useRole(roleName: string): boolean {
  const { user } = useAuthStore();
  
  if (!user || !user.roles) {
    return false;
  }
  
  // Check if user has the specific role (case-insensitive)
  return user.roles.some((r) => 
    r.name.toLowerCase() === roleName.toLowerCase()
  );
}

/**
 * Check if the current user has ANY of the specified roles
 * 
 * @param roleNames - Array of role names to check
 * @returns boolean - true if user has at least one of the roles
 * 
 * @example
 * ```tsx
 * const canManageUsers = useAnyRole(['Admin', 'User Admin', 'Security Admin']);
 * if (canManageUsers) {
 *   // Show user management buttons
 * }
 * ```
 */
export function useAnyRole(roleNames: string[]): boolean {
  const { user } = useAuthStore();
  
  if (!user || !user.roles) {
    return false;
  }
  
  // Check if user has any of the specified roles
  return user.roles.some((r) =>
    roleNames.some((roleName) => 
      r.name.toLowerCase() === roleName.toLowerCase()
    )
  );
}

/**
 * Check if the current user has ALL of the specified roles
 * 
 * @param roleNames - Array of role names to check
 * @returns boolean - true if user has all of the roles
 * 
 * @example
 * ```tsx
 * const hasMultipleRoles = useAllRoles(['Admin', 'Security Admin']);
 * if (hasMultipleRoles) {
 *   // Show advanced security options
 * }
 * ```
 */
export function useAllRoles(roleNames: string[]): boolean {
  const { user } = useAuthStore();
  
  if (!user || !user.roles) {
    return false;
  }
  
  // Check if user has all of the specified roles
  return roleNames.every((roleName) =>
    user.roles.some((r) => 
      r.name.toLowerCase() === roleName.toLowerCase()
    )
  );
}

/**
 * Get common role checks for the current user
 * 
 * Returns an object with boolean flags for common roles:
 * - isAdmin: User is an Admin or SuperAdmin
 * - isSuperAdmin: User is a SuperAdmin
 * - isApprover: User has any approver role
 * - isWorkflowAdmin: User is a Workflow Admin
 * - isCatalogAdmin: User is a Catalog Admin
 * - isSecurityAdmin: User is a Security Admin
 * - roles: Array of all user roles
 * 
 * @returns Object with role check flags
 * 
 * @example
 * ```tsx
 * const { isAdmin, isApprover, roles } = useRoles();
 * 
 * return (
 *   <>
 *     {isAdmin && <button>Admin Panel</button>}
 *     {isApprover && <button>Approve</button>}
 *     <span>Roles: {roles.map(r => r.name).join(', ')}</span>
 *   </>
 * );
 * ```
 */
export function useRoles() {
  const { user } = useAuthStore();
  
  if (!user || !user.roles) {
    return {
      isAdmin: false,
      isSuperAdmin: false,
      isApprover: false,
      isWorkflowAdmin: false,
      isCatalogAdmin: false,
      isSecurityAdmin: false,
      isUserAdmin: false,
      isApprovalAdmin: false,
      isCatalogEditor: false,
      isITIL: false,
      roles: [],
    };
  }
  
  const roles = user.roles;
  
  return {
    // Check if user is Admin or SuperAdmin
    isAdmin: roles.some((r) => 
      ['admin', 'superadmin'].includes(r.name.toLowerCase())
    ),
    
    // Check if user is SuperAdmin
    isSuperAdmin: roles.some((r) => 
      r.name.toLowerCase() === 'superadmin'
    ),
    
    // Check if user has any approver role
    isApprover: roles.some((r) => 
      r.name.toLowerCase().includes('approver') ||
      r.name.toLowerCase().includes('approval')
    ),
    
    // Check for specific admin roles
    isWorkflowAdmin: roles.some((r) => 
      r.name.toLowerCase() === 'workflow_admin' ||
      r.name.toLowerCase() === 'workflow admin'
    ),
    
    isCatalogAdmin: roles.some((r) => 
      r.name.toLowerCase() === 'catalog_admin' ||
      r.name.toLowerCase() === 'catalog admin'
    ),
    
    isSecurityAdmin: roles.some((r) => 
      r.name.toLowerCase() === 'security_admin' ||
      r.name.toLowerCase() === 'security admin'
    ),
    
    isUserAdmin: roles.some((r) => 
      r.name.toLowerCase() === 'user_admin' ||
      r.name.toLowerCase() === 'user admin'
    ),
    
    isApprovalAdmin: roles.some((r) => 
      r.name.toLowerCase() === 'approval_admin' ||
      r.name.toLowerCase() === 'approval admin'
    ),
    
    isCatalogEditor: roles.some((r) => 
      r.name.toLowerCase() === 'catalog_editor' ||
      r.name.toLowerCase() === 'catalog editor'
    ),
    
    isITIL: roles.some((r) => 
      r.name.toLowerCase() === 'itil'
    ),
    
    // Return all roles
    roles,
  };
}

/**
 * Get the current user object
 * 
 * @returns User object or null if not authenticated
 * 
 * @example
 * ```tsx
 * const user = useCurrentUser();
 * if (user) {
 *   console.log(user.email, user.roles);
 * }
 * ```
 */
export function useCurrentUser(): User | null {
  const { user } = useAuthStore();
  return user;
}

/**
 * Check if the user is authenticated
 * 
 * @returns boolean - true if user is authenticated
 * 
 * @example
 * ```tsx
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) {
 *   return <LoginPrompt />;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}
