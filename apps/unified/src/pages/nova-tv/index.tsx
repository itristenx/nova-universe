import React, { useState, useEffect } from 'react';
import { Plus, Monitor, BarChart3, Settings, Play, Pause, Edit, Trash2, Copy } from 'lucide-react';
import { novaTVService, Dashboard } from '../../services/nova-tv';

const NovaTVDashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    loadDashboards();
  }, [selectedDepartment]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const filters = selectedDepartment !== 'all' ? { department: selectedDepartment } : {};
      const data = await novaTVService.getDashboards(filters);
      setDashboards(data);
    } catch (_error) {
      // Handle error silently, show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const toggleDashboard = async (id: string, isActive: boolean) => {
    try {
      await novaTVService.updateDashboard(id, { isActive: !isActive });
      loadDashboards();
    } catch (_error) {
      // Handle error silently
    }
  };

  const duplicateDashboard = async (id: string, name: string) => {
    try {
      const newName = prompt('Enter name for duplicated dashboard:', `${name} - Copy`);
      if (newName) {
        await novaTVService.duplicateDashboard(id, newName);
        loadDashboards();
      }
    } catch (_error) {
      console.error('Error duplicating dashboard:', error);
    }
  };

  const deleteDashboard = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await novaTVService.deleteDashboard(id);
        loadDashboards();
      } catch (_error) {
        console.error('Error deleting dashboard:', error);
      }
    }
  };

  const departments = ['all', 'IT', 'HR', 'Finance', 'Operations', 'Marketing'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova TV Digital Signage</h1>
            <p className="mt-1 text-gray-600">Manage and monitor your digital displays</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dashboards</p>
              <p className="text-2xl font-bold text-gray-900">{dashboards.length}</p>
            </div>
            <Monitor className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Displays</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboards.filter((d) => d.isActive).length}
              </p>
            </div>
            <Play className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Devices</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Monitor className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Analytics</p>
              <p className="text-2xl font-bold text-gray-900">245</p>
              <p className="text-xs text-gray-500">Views today</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by department"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Dashboard Preview */}
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <Monitor className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500">Dashboard Preview</p>
                </div>
              </div>

              {/* Dashboard Info */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{dashboard.name}</h3>
                    <p className="text-sm text-gray-600">{dashboard.department}</p>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      dashboard.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dashboard.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {dashboard.description && (
                  <p className="mb-3 text-sm text-gray-600">{dashboard.description}</p>
                )}

                <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {new Date(dashboard.createdAt).toLocaleDateString()}</span>
                  <span>By: {dashboard.creator?.name || 'Unknown'}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDashboard(dashboard.id, dashboard.isActive)}
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      dashboard.isActive
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {dashboard.isActive ? (
                      <>
                        <Pause className="mr-1 inline h-3 w-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 inline h-3 w-3" />
                        Activate
                      </>
                    )}
                  </button>

                  <button
                    className="rounded-md p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    title="Edit dashboard"
                    aria-label="Edit dashboard"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => duplicateDashboard(dashboard.id, dashboard.name)}
                    className="rounded-md p-2 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
                    title="Duplicate dashboard"
                    aria-label="Duplicate dashboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    title="Dashboard settings"
                    aria-label="Dashboard settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => deleteDashboard(dashboard.id, dashboard.name)}
                    className="rounded-md p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete dashboard"
                    aria-label="Delete dashboard"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Dashboard Card */}
          <div className="cursor-pointer overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white shadow-sm transition-colors hover:border-blue-400">
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <Plus className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">Create New Dashboard</p>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-center text-lg font-medium text-gray-700">New Dashboard</h3>
              <p className="mt-1 text-center text-sm text-gray-500">Click to start building</p>
            </div>
          </div>
        </div>
      )}

      {dashboards.length === 0 && !loading && (
        <div className="py-12 text-center">
          <Monitor className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No dashboards found</h3>
          <p className="mb-4 text-gray-600">
            {selectedDepartment !== 'all'
              ? `No dashboards found for ${selectedDepartment} department.`
              : 'Get started by creating your first digital signage dashboard.'}
          </p>
          <button className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create Your First Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default NovaTVDashboard;
