import React from 'react';
import { QrCodeIcon, PlusIcon, UserPlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface QuickActionsProps {
  onScanPackage: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onScanPackage }) => {
  const actions = [
    {
      name: 'Scan Package',
      description: 'Scan a package label to receive it',
      icon: QrCodeIcon,
      color: 'bg-violet-500 hover:bg-violet-600',
      onClick: onScanPackage,
    },
    {
      name: 'Manual Entry',
      description: 'Manually enter package details',
      icon: PlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Manual entry clicked'),
    },
    {
      name: 'Add Recipient',
      description: 'Add a new package recipient',
      icon: UserPlusIcon,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Add recipient clicked'),
    },
    {
      name: 'Generate Report',
      description: 'Create delivery reports',
      icon: DocumentTextIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Generate report clicked'),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={action.onClick}
            className="group relative rounded-lg bg-white p-6 shadow transition-shadow duration-200 focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-inset hover:shadow-md"
          >
            <div>
              <span className={`inline-flex rounded-lg p-3 text-white ${action.color}`}>
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
                {action.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
