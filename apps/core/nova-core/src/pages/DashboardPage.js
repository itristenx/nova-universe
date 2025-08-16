import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import {
  ComputerDesktopIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
const StatCard = ({ title, value, icon: Icon, color, change }) => {
  return React.createElement(
    Card,
    null,
    React.createElement(
      CardBody,
      { className: 'p-6' },
      React.createElement(
        'div',
        { className: 'flex items-center' },
        React.createElement(
          'div',
          { className: `p-3 rounded-lg ${color}` },
          React.createElement(Icon, { className: 'h-6 w-6 text-white' }),
        ),
        React.createElement(
          'div',
          { className: 'ml-4 flex-1' },
          React.createElement('p', { className: 'text-sm font-medium text-gray-600' }, title),
          React.createElement(
            'div',
            { className: 'flex items-baseline' },
            React.createElement(
              'p',
              { className: 'text-2xl font-semibold text-gray-900' },
              value.toLocaleString(),
            ),
            change !== undefined &&
              React.createElement(
                'span',
                {
                  className: `ml-2 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`,
                },
                change >= 0 ? '+' : '',
                change,
                '%',
              ),
          ),
        ),
      ),
    ),
  );
};
export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, ticketsData, kiosksData] = await Promise.all([
          api.getDashboardStats(),
          api.getLogs(),
          api.getKiosks(),
        ]);
        setStats(statsData);
        setRecentTickets(ticketsData.slice(0, 10));
        setKiosks(kiosksData.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);
  if (loading) {
    return React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' },
        [...Array(4)].map((_, i) =>
          React.createElement(
            'div',
            { key: i, className: 'animate-pulse' },
            React.createElement('div', { className: 'bg-gray-200 h-32 rounded-lg' }),
          ),
        ),
      ),
    );
  }
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      null,
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Dashboard'),
      React.createElement(
        'p',
        { className: 'mt-1 text-sm text-gray-600' },
        "Welcome back! Here's what's happening with your kiosks and support system.",
      ),
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' },
      React.createElement(StatCard, {
        title: 'Total Kiosks',
        value: stats?.totalKiosks || 0,
        icon: ComputerDesktopIcon,
        color: 'bg-blue-500',
      }),
      React.createElement(StatCard, {
        title: 'Active Kiosks',
        value: stats?.activeKiosks || 0,
        icon: ComputerDesktopIcon,
        color: 'bg-green-500',
      }),
      React.createElement(StatCard, {
        title: 'Total Tickets',
        value: stats?.totalTickets || 0,
        icon: DocumentTextIcon,
        color: 'bg-purple-500',
      }),
      React.createElement(StatCard, {
        title: 'Pending Tickets',
        value: stats?.pendingTickets || 0,
        icon: ExclamationTriangleIcon,
        color: 'bg-orange-500',
      }),
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement(
        Card,
        null,
        React.createElement(
          CardHeader,
          null,
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Recent Tickets'),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-600' },
              'Latest support requests',
            ),
          ),
        ),
        React.createElement(
          CardBody,
          null,
          React.createElement(
            'div',
            { className: 'space-y-3' },
            recentTickets.length === 0
              ? React.createElement(
                  'p',
                  { className: 'text-sm text-gray-500' },
                  'No recent tickets',
                )
              : recentTickets.map((ticket) =>
                  React.createElement(
                    'div',
                    {
                      key: ticket.id,
                      className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg',
                    },
                    React.createElement(
                      'div',
                      { className: 'flex-1' },
                      React.createElement(
                        'h4',
                        { className: 'text-sm font-medium text-gray-900' },
                        ticket.title,
                      ),
                      React.createElement(
                        'p',
                        { className: 'text-xs text-gray-600' },
                        ticket.name,
                        ' \u2022 ',
                        ticket.email,
                      ),
                    ),
                    React.createElement(
                      'div',
                      { className: 'flex items-center space-x-2' },
                      React.createElement(
                        'span',
                        {
                          className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.urgency === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : ticket.urgency === 'High'
                                ? 'bg-orange-100 text-orange-800'
                                : ticket.urgency === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                          }`,
                        },
                        ticket.urgency,
                      ),
                      React.createElement(
                        'span',
                        {
                          className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.emailStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`,
                        },
                        ticket.emailStatus,
                      ),
                    ),
                  ),
                ),
          ),
        ),
      ),
      React.createElement(
        Card,
        null,
        React.createElement(
          CardHeader,
          null,
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Kiosk Status'),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-600' },
              'Real-time status of your kiosks',
            ),
          ),
        ),
        React.createElement(
          CardBody,
          null,
          React.createElement(
            'div',
            { className: 'space-y-3' },
            kiosks.length === 0
              ? React.createElement(
                  'p',
                  { className: 'text-sm text-gray-500' },
                  'No kiosks registered',
                )
              : kiosks
                  .slice(0, 5)
                  .map((kiosk) =>
                    React.createElement(
                      'div',
                      {
                        key: kiosk.id,
                        className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg',
                      },
                      React.createElement(
                        'div',
                        { className: 'flex-1' },
                        React.createElement(
                          'h4',
                          { className: 'text-sm font-medium text-gray-900' },
                          'Kiosk ',
                          kiosk.id,
                        ),
                        React.createElement(
                          'p',
                          { className: 'text-xs text-gray-600' },
                          'Last seen: ',
                          new Date(kiosk.lastSeen).toLocaleDateString(),
                        ),
                      ),
                      React.createElement(
                        'div',
                        { className: 'flex items-center space-x-2' },
                        React.createElement(
                          'span',
                          {
                            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kiosk.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`,
                          },
                          kiosk.active ? 'Active' : 'Inactive',
                        ),
                        React.createElement(
                          'span',
                          {
                            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              kiosk.effectiveConfig.currentStatus === 'open'
                                ? 'bg-blue-100 text-blue-800'
                                : kiosk.effectiveConfig.currentStatus === 'closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                            }`,
                          },
                          kiosk.effectiveConfig.currentStatus || 'Unknown',
                        ),
                      ),
                    ),
                  ),
          ),
        ),
      ),
    ),
  );
};
