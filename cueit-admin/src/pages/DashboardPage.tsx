import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import {
  ComputerDesktopIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import type { DashboardStats, Log, Kiosk } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
            {change !== undefined && (
              <span
                className={`ml-2 text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Log[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ticketsData, kiosksData] = await Promise.all([
          // For now, we'll calculate stats from existing data since the endpoint might not exist
          api.getLogs(),
          api.getKiosks(),
        ]);

        // Calculate stats from logs
        const totalTickets = ticketsData.length;
        const openTickets = ticketsData.filter((t: Log) => t.emailStatus === 'success').length;
        const pendingTickets = ticketsData.filter((t: Log) => t.emailStatus === 'fail').length;
        
        const calculatedStats: DashboardStats = {
          totalKiosks: kiosksData.length,
          activeKiosks: kiosksData.filter((k: Kiosk) => k.active).length,
          totalTickets,
          openTickets,
          pendingTickets,
          resolvedTickets: openTickets,
          totalUsers: 0, // Will be updated when we add user count API
          recentActivity: ticketsData.slice(0, 3).map((ticket: Log) => ({
            id: ticket.id,
            type: 'ticket_created',
            message: `New ticket: ${ticket.title}`,
            timestamp: ticket.timestamp,
          })),
        };

        setStats(calculatedStats);
        setRecentTickets(ticketsData.slice(0, 5));
        setKiosks(kiosksData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your kiosks and support system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Kiosks"
          value={stats?.totalKiosks || 0}
          icon={ComputerDesktopIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Kiosks"
          value={stats?.activeKiosks || 0}
          icon={ComputerDesktopIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets || 0}
          icon={DocumentTextIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Tickets"
          value={stats?.pendingTickets || 0}
          icon={ExclamationTriangleIcon}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card title="Recent Tickets" description="Latest support requests">
          <div className="space-y-3">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-gray-500">No recent tickets</p>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{ticket.title}</h4>
                    <p className="text-xs text-gray-600">{ticket.name} • {ticket.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                      ticket.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                      ticket.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.urgency}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.emailStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ticket.emailStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Kiosk Status */}
        <Card title="Kiosk Status" description="Real-time status of your kiosks">
          <div className="space-y-3">
            {kiosks.length === 0 ? (
              <p className="text-sm text-gray-500">No kiosks registered</p>
            ) : (
              kiosks.slice(0, 5).map((kiosk) => (
                <div key={kiosk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Kiosk {kiosk.id}</h4>
                    <p className="text-xs text-gray-600">Last seen: {new Date(kiosk.lastSeen).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      kiosk.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {kiosk.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      kiosk.currentStatus === 'open' ? 'bg-blue-100 text-blue-800' :
                      kiosk.currentStatus === 'closed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {kiosk.currentStatus || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
