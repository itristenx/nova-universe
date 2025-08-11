import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Checkbox, Select } from '@/components/ui';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { EmailAccount } from '@/types';

interface AccountForm {
  queue: 'IT' | 'HR' | 'OPS' | 'CYBER';
  address: string;
  displayName: string;
  enabled: boolean;
  graphImpersonation: boolean;
  autoCreateTickets: boolean;
  webhookMode: boolean;
}

export const EmailAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<EmailAccount | null>(null);
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState<AccountForm>({
    queue: 'IT',
    address: '',
    displayName: '',
    enabled: true,
    graphImpersonation: false,
    autoCreateTickets: true,
    webhookMode: false,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getEmailAccounts();
      setAccounts(data);
    } catch {
      addToast({ type: 'error', title: 'Error', description: 'Failed to load accounts' });
    }
  };

  const save = async () => {
    try {
      if (editing) {
        await api.updateEmailAccount(editing.id, formData);
      } else {
        await api.createEmailAccount(formData);
      }
      setShowModal(false);
      setEditing(null);
      await load();
      addToast({ type: 'success', title: 'Saved', description: 'Email account saved' });
    } catch {
      addToast({ type: 'error', title: 'Error', description: 'Failed to save account' });
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this account?')) return;
    await api.deleteEmailAccount(id);
    await load();
  };

  const openEdit = (acc: EmailAccount) => {
    setEditing(acc);
    setFormData({
      queue: acc.queue,
      address: acc.address,
      displayName: acc.displayName || '',
      enabled: acc.enabled,
      graphImpersonation: acc.graphImpersonation,
      autoCreateTickets: acc.autoCreateTickets,
      webhookMode: acc.webhookMode,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Accounts</h1>
        <Button variant="primary" onClick={() => { setEditing(null); setFormData({ queue: 'IT', address: '', displayName: '', enabled: true, graphImpersonation: false, autoCreateTickets: true, webhookMode: false }); setShowModal(true); }}>
          <PlusIcon className="h-4 w-4 mr-1" /> Add Account
        </Button>
      </div>
      {accounts.map(acc => (
        <Card key={acc.id} className="flex justify-between items-center p-4">
          <div>
            <p className="font-medium">{acc.displayName || acc.address}</p>
            <p className="text-sm text-gray-500">Queue: {acc.queue}</p>
          </div>
          <div className="space-x-2">
            <Button size="sm" onClick={() => openEdit(acc)}><PencilIcon className="h-4 w-4"/></Button>
            <Button size="sm" variant="danger" onClick={() => remove(acc.id)}><TrashIcon className="h-4 w-4"/></Button>
          </div>
        </Card>
      ))}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Email Account">
        <div className="space-y-4">
          <Select
            label="Queue"
            value={formData.queue}
            onChange={value => setFormData({ ...formData, queue: value as AccountForm['queue'] })}
            options={[
              { value: 'IT', label: 'IT' },
              { value: 'HR', label: 'HR' },
              { value: 'OPS', label: 'OPS' },
              { value: 'CYBER', label: 'CYBER' },
            ]}
          />
          <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          <Input label="Display Name" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
          <Checkbox label="Enabled" checked={formData.enabled} onChange={v => setFormData({ ...formData, enabled: v })} />
          <Checkbox label="Graph Impersonation" checked={formData.graphImpersonation} onChange={v => setFormData({ ...formData, graphImpersonation: v })} />
          <Checkbox label="Auto Create Tickets" checked={formData.autoCreateTickets} onChange={v => setFormData({ ...formData, autoCreateTickets: v })} />
          <Checkbox label="Webhook Mode" checked={formData.webhookMode} onChange={v => setFormData({ ...formData, webhookMode: v })} />
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
