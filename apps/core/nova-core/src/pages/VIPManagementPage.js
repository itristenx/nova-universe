import React, { useEffect, useState } from 'react';
import { Card, Select } from '@heroui/react';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const VIPManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Error', description: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };
  const updateVip = async (user, isVip, vipLevel) => {
    try {
      await api.updateVipStatus(user.id, { isVip, vipLevel });
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, is_vip: isVip, vip_level: vipLevel } : u)),
      );
      addToast({ type: 'success', title: 'Updated', description: 'VIP status saved' });
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Error', description: 'Failed to update VIP' });
    }
  };
  if (loading) return React.createElement('div', null, 'Loading...');
  return React.createElement(
    Card,
    null,
    React.createElement('h1', { className: 'text-xl font-semibold mb-4' }, 'VIP Management'),
    React.createElement(
      'table',
      { className: 'min-w-full divide-y divide-gray-200' },
      React.createElement(
        'thead',
        { className: 'bg-gray-50' },
        React.createElement(
          'tr',
          null,
          React.createElement('th', { className: 'px-4 py-2 text-left' }, 'User'),
          React.createElement('th', { className: 'px-4 py-2 text-left' }, 'VIP'),
          React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Level'),
        ),
      ),
      React.createElement(
        'tbody',
        { className: 'bg-white divide-y divide-gray-200' },
        users.map((u) =>
          React.createElement(
            'tr',
            { key: u.id },
            React.createElement('td', { className: 'px-4 py-2' }, u.name),
            React.createElement(
              'td',
              { className: 'px-4 py-2' },
              React.createElement('input', {
                type: 'checkbox',
                checked: !!u.is_vip,
                onChange: (e) => updateVip(u, e.target.checked, u.vip_level || 'priority'),
              }),
            ),
            React.createElement(
              'td',
              { className: 'px-4 py-2' },
              React.createElement(
                Select,
                {
                  value: u.vip_level || 'priority',
                  onChange: (val) => updateVip(u, !!u.is_vip, val),
                },
                React.createElement('option', { value: 'priority' }, 'priority'),
                React.createElement('option', { value: 'gold' }, 'gold'),
                React.createElement('option', { value: 'exec' }, 'exec'),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
