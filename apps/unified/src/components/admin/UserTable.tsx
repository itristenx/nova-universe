import { formatRelativeTime, getUserDisplayName, getInitials, cn } from '@utils/index';
import { PencilIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import type { User } from '@/types';

interface UserTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onEditUser: (user: User) => void;
  onUserUpdate: (user: User) => void;
}

export function UserTable({
  users,
  selectedUsers,
  onSelectionChange,
  onEditUser,
  onUserUpdate,
}: UserTableProps) {
  const allSelected = users.length > 0 && users.every((user) => selectedUsers.includes(user.id));
  const someSelected = selectedUsers.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map((user) => user.id));
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleToggleActive = (user: User) => {
    onUserUpdate({ ...user, isActive: !user.isActive });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
                className="text-nova-600 focus:ring-nova-500 h-4 w-4 rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Last Login
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {users.map((user) => (
            <tr
              key={user.id}
              className={cn(
                'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                selectedUsers.includes(user.id) && 'bg-nova-50 dark:bg-nova-900/20',
              )}
            >
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                  className="text-nova-600 focus:ring-nova-500 h-4 w-4 rounded border-gray-300"
                />
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={getUserDisplayName(user)}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                      {getInitials(getUserDisplayName(user))}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </td>

              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </td>

              <td className="px-4 py-4">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                  )}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>

              <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditUser(user)}
                    className="btn btn-ghost btn-sm"
                    title="Edit user"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(user)}
                    className={cn(
                      'btn btn-sm',
                      user.isActive ? 'btn-ghost text-red-600' : 'btn-ghost text-green-600',
                    )}
                    title={user.isActive ? 'Deactivate user' : 'Activate user'}
                  >
                    {user.isActive ? (
                      <LockClosedIcon className="h-4 w-4" />
                    ) : (
                      <LockOpenIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
