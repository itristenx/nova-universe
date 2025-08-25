import { useState, useEffect } from 'react';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';
import { EmailAccountsService } from '@services/emailAccounts';

// Simple icon components
const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface EmailAccount {
  id: number;
  queue: string;
  address: string;
  displayName: string;
  enabled: boolean;
  graphImpersonation: boolean;
  autoCreateTickets: boolean;
  webhookMode: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountForm {
  queue: string;
  address: string;
  displayName: string;
  enabled: boolean;
  graphImpersonation: boolean;
  autoCreateTickets: boolean;
  webhookMode: boolean;
}

export default function EmailAccountsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<EmailAccount | null>(null);
  const [formData, setFormData] = useState<AccountForm>({
    queue: 'IT',
    address: '',
    displayName: '',
    enabled: true,
    graphImpersonation: false,
    autoCreateTickets: true,
    webhookMode: false,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const accounts = await EmailAccountsService.getAll();
      setAccounts(accounts);
    } catch (_error) {
      console.error('Failed to load email accounts:', error);
      toast.error('Failed to load email accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAccount = async () => {
    try {
      if (editing) {
        await EmailAccountsService.update(editing.id, formData);
      } else {
        await EmailAccountsService.create(formData);
      }

      setShowModal(false);
      setEditing(null);
      await loadAccounts();
      toast.success('Email account saved successfully');
    } catch (_error) {
      console.error('Failed to save email account:', error);
      toast.error('Failed to save email account');
    }
  };

  const deleteAccount = async (id: number) => {
    if (!window.confirm('Delete this email account? This action cannot be undone.')) return;

    try {
      await EmailAccountsService.delete(id);
      await loadAccounts();
      toast.success('Email account deleted successfully');
    } catch (_error) {
      console.error('Failed to delete email account:', error);
      toast.error('Failed to delete email account');
    }
  };

  const openEditModal = (account: EmailAccount) => {
    setEditing(account);
    setFormData({
      queue: account.queue,
      address: account.address,
      displayName: account.displayName,
      enabled: account.enabled,
      graphImpersonation: account.graphImpersonation,
      autoCreateTickets: account.autoCreateTickets,
      webhookMode: account.webhookMode,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormData({
      queue: 'IT',
      address: '',
      displayName: '',
      enabled: true,
      graphImpersonation: false,
      autoCreateTickets: true,
      webhookMode: false,
    });
    setShowModal(true);
  };

  const getQueueColor = (queue: string) => {
    switch (queue) {
      case 'IT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'HR':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'OPS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CYBER':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Accounts</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage email accounts for automatic ticket creation
            </p>
          </div>
        </div>

        <div className="card p-12 text-center">
          <div className="border-primary-600 mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading email accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Accounts</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage email accounts for automatic ticket creation and queue routing
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <PlusIcon className="h-4 w-4" />
          Add Email Account
        </button>
      </div>

      {/* Email Accounts Table */}
      <div className="card">
        {accounts.length === 0 ? (
          <div className="p-12 text-center">
            <EnvelopeIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No email accounts configured
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Add email accounts to enable automatic ticket creation from incoming emails.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary">
              <PlusIcon className="h-4 w-4" />
              Add First Email Account
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Queue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {account.displayName || account.address}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {account.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          getQueueColor(account.queue),
                        )}
                      >
                        {account.queue}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {account.autoCreateTickets && (
                          <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Auto Tickets
                          </span>
                        )}
                        {account.graphImpersonation && (
                          <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Graph API
                          </span>
                        )}
                        {account.webhookMode && (
                          <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Webhook
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          account.enabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                        )}
                      >
                        {account.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(account)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit account"
                          aria-label="Edit account"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete account"
                          aria-label="Delete account"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {editing ? 'Edit Email Account' : 'Add Email Account'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                title="Close modal"
                aria-label="Close modal"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label
                  htmlFor="queue-select"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Queue
                </label>
                <select
                  id="queue-select"
                  value={formData.queue}
                  onChange={(e) => setFormData({ ...formData, queue: e.target.value as any })}
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="IT">IT Support</option>
                  <option value="HR">Human Resources</option>
                  <option value="OPS">Operations</option>
                  <option value="CYBER">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="support@company.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Support Team"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    Account enabled
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoCreateTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, autoCreateTickets: e.target.checked })
                    }
                    className="text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    Auto-create tickets from emails
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.graphImpersonation}
                    onChange={(e) =>
                      setFormData({ ...formData, graphImpersonation: e.target.checked })
                    }
                    className="text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    Use Microsoft Graph impersonation
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.webhookMode}
                    onChange={(e) => setFormData({ ...formData, webhookMode: e.target.checked })}
                    className="text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    Webhook mode (receive via HTTP POST)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveAccount} className="btn btn-primary">
                {editing ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
