import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Checkbox, Select } from '@heroui/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const EmailAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { addToast } = useToastStore();
  const [formData, setFormData] = useState({
    queue: 'IT',
    address: '',
    displayName: '',
    enabled: true,
    graphImpersonation: false,
    autoCreateTickets: true,
    webhookMode: false,
  });
  useEffect(() => {
    load();
  }, []);
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
  const remove = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await api.deleteEmailAccount(id);
    await load();
  };
  const openEdit = (acc) => {
    setEditing(acc);
    setFormData({ ...acc });
    setShowModal(true);
  };
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Email Accounts'),
      React.createElement(
        Button,
        {
          variant: 'primary',
          onClick: () => {
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
          },
        },
        React.createElement(PlusIcon, { className: 'h-4 w-4 mr-1' }),
        ' Add Account',
      ),
    ),
    accounts.map((acc) =>
      React.createElement(
        Card,
        { key: acc.id, className: 'flex justify-between items-center p-4' },
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: 'font-medium' }, acc.displayName || acc.address),
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Queue: ', acc.queue),
        ),
        React.createElement(
          'div',
          { className: 'space-x-2' },
          React.createElement(
            Button,
            { size: 'sm', onClick: () => openEdit(acc) },
            React.createElement(PencilIcon, { className: 'h-4 w-4' }),
          ),
          React.createElement(
            Button,
            { size: 'sm', variant: 'danger', onClick: () => remove(acc.id) },
            React.createElement(TrashIcon, { className: 'h-4 w-4' }),
          ),
        ),
      ),
    ),
    React.createElement(
      Modal,
      { isOpen: showModal, onClose: () => setShowModal(false), title: 'Email Account' },
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(Select, {
          label: 'Queue',
          value: formData.queue,
          onChange: (value) => setFormData({ ...formData, queue: value }),
          options: [
            { value: 'IT', label: 'IT' },
            { value: 'HR', label: 'HR' },
            { value: 'OPS', label: 'OPS' },
            { value: 'CYBER', label: 'CYBER' },
          ],
        }),
        React.createElement(Input, {
          label: 'Address',
          value: formData.address,
          onChange: (e) => setFormData({ ...formData, address: e.target.value }),
        }),
        React.createElement(Input, {
          label: 'Display Name',
          value: formData.displayName,
          onChange: (e) => setFormData({ ...formData, displayName: e.target.value }),
        }),
        React.createElement(Checkbox, {
          label: 'Enabled',
          checked: formData.enabled,
          onChange: (v) => setFormData({ ...formData, enabled: v }),
        }),
        React.createElement(Checkbox, {
          label: 'Graph Impersonation',
          checked: formData.graphImpersonation,
          onChange: (v) => setFormData({ ...formData, graphImpersonation: v }),
        }),
        React.createElement(Checkbox, {
          label: 'Auto Create Tickets',
          checked: formData.autoCreateTickets,
          onChange: (v) => setFormData({ ...formData, autoCreateTickets: v }),
        }),
        React.createElement(Checkbox, {
          label: 'Webhook Mode',
          checked: formData.webhookMode,
          onChange: (v) => setFormData({ ...formData, webhookMode: v }),
        }),
        React.createElement(
          'div',
          { className: 'flex justify-end space-x-2' },
          React.createElement(Button, { onClick: () => setShowModal(false) }, 'Cancel'),
          React.createElement(Button, { variant: 'primary', onClick: save }, 'Save'),
        ),
      ),
    ),
  );
};
