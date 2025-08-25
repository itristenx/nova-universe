import { Link } from 'react-router-dom';
import { useAuthStore } from '@stores/auth';
import {
  TicketIcon,
  CubeIcon,
  MapIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

interface QuickAction {
  id?: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  roles?: string[];
}

export function QuickActions() {
  const { user } = useAuthStore();

  const getUserRole = () => {
    if (!user?.roles) return 'user';
    if (user.roles.some((role) => role.name === 'admin')) return 'admin';
    if (user.roles.some((role) => role.name === 'agent')) return 'agent';
    return 'user';
  };

  const userRole = getUserRole();

  const getActionsForRole = (): QuickAction[] => {
    switch (userRole) {
      case 'admin':
        return [
          {
            name: 'User Management',
            href: '/admin/users',
            icon: UserGroupIcon,
            color: 'bg-blue-500',
            description: 'Manage users and permissions',
          },
          {
            name: 'System Reports',
            href: '/admin/reports',
            icon: ChartBarIcon,
            color: 'bg-green-500',
            description: 'View analytics and metrics',
          },
          {
            name: 'Configuration',
            href: '/admin/settings',
            icon: CogIcon,
            color: 'bg-purple-500',
            description: 'System configuration',
          },
          {
            name: 'Create Ticket',
            href: '/tickets/new',
            icon: TicketIcon,
            color: 'bg-orange-500',
            description: 'Create new support ticket',
          },
        ];

      case 'agent':
        return [
          {
            name: 'New Ticket',
            href: '/tickets/new',
            icon: PlusCircleIcon,
            color: 'bg-blue-500',
            description: 'Create new ticket',
          },
          {
            name: 'My Queue',
            href: '/tickets/queue',
            icon: TicketIcon,
            color: 'bg-green-500',
            description: 'View assigned tickets',
          },
          {
            name: 'Knowledge Base',
            href: '/knowledge',
            icon: DocumentTextIcon,
            color: 'bg-purple-500',
            description: 'Search solutions',
          },
          {
            name: 'Asset Lookup',
            href: '/assets',
            icon: CubeIcon,
            color: 'bg-orange-500',
            description: 'Find asset information',
          },
        ];

      default: // user
        return [
          {
            name: 'Submit Request',
            href: '/tickets/new',
            icon: TicketIcon,
            color: 'bg-blue-500',
            description: 'Create new service request',
          },
          {
            name: 'My Tickets',
            href: '/tickets/my',
            icon: DocumentTextIcon,
            color: 'bg-green-500',
            description: 'View your tickets',
          },
          {
            name: 'Book Space',
            href: '/spaces/booking',
            icon: MapIcon,
            color: 'bg-purple-500',
            description: 'Reserve meeting rooms',
          },
          {
            name: 'My Assets',
            href: '/assets/my',
            icon: CubeIcon,
            color: 'bg-orange-500',
            description: 'View assigned equipment',
          },
        ];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="card p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div
              className={`flex-shrink-0 rounded-lg p-3 ${action.color} transition-transform duration-200 group-hover:scale-105`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="group-hover:text-nova-600 dark:group-hover:text-nova-400 block font-medium text-gray-900 transition-colors dark:text-gray-100">
                {action.name}
              </span>
              {action.description && (
                <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
