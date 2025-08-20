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
    } catch (error) {
      console.error('Error loading dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDashboard = async (id: string, isActive: boolean) => {
    try {
      await novaTVService.updateDashboard(id, { isActive: !isActive });
      loadDashboards();
    } catch (error) {
      console.error('Error toggling dashboard:', error);
    }
  };

  const duplicateDashboard = async (id: string, name: string) => {
    try {
      const newName = prompt('Enter name for duplicated dashboard:', `${name} - Copy`);
      if (newName) {
        await novaTVService.duplicateDashboard(id, newName);
        loadDashboards();
      }
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
    }
  };

  const deleteDashboard = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await novaTVService.deleteDashboard(id);
        loadDashboards();
      } catch (error) {
        console.error('Error deleting dashboard:', error);
      }
    }
  };

  const departments = ['all', 'IT', 'HR', 'Finance', 'Operations', 'Marketing'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova TV Digital Signage</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your digital displays</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Create Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dashboards</p>
              <p className="text-2xl font-bold text-gray-900">{dashboards.length}</p>
            </div>
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Displays</p>
              <p className="text-2xl font-bold text-gray-900">{dashboards.filter(d => d.isActive).length}</p>
            </div>
            <Play className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Devices</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Monitor className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Analytics</p>
              <p className="text-2xl font-bold text-gray-900">245</p>
              <p className="text-xs text-gray-500">Views today</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter by department"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Dashboard Preview */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Dashboard Preview</p>
                </div>
              </div>

              {/* Dashboard Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{dashboard.name}</h3>
                    <p className="text-sm text-gray-600">{dashboard.department}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dashboard.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dashboard.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {dashboard.description && (
                  <p className="text-sm text-gray-600 mb-3">{dashboard.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Created: {new Date(dashboard.createdAt).toLocaleDateString()}</span>
                  <span>By: {dashboard.creator?.name || 'Unknown'}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDashboard(dashboard.id, dashboard.isActive)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      dashboard.isActive
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {dashboard.isActive ? (
                      <>
                        <Pause className="w-3 h-3 inline mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 inline mr-1" />
                        Activate
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit dashboard"
                    aria-label="Edit dashboard"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => duplicateDashboard(dashboard.id, dashboard.name)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="Duplicate dashboard"
                    aria-label="Duplicate dashboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button 
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                    title="Dashboard settings"
                    aria-label="Dashboard settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => deleteDashboard(dashboard.id, dashboard.name)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete dashboard"
                    aria-label="Delete dashboard"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Dashboard Card */}
          <div className="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 overflow-hidden hover:border-blue-400 transition-colors cursor-pointer">
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Create New Dashboard</p>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-700 text-center">New Dashboard</h3>
              <p className="text-sm text-gray-500 text-center mt-1">Click to start building</p>
            </div>
          </div>
        </div>
      )}

      {dashboards.length === 0 && !loading && (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboards found</h3>
          <p className="text-gray-600 mb-4">
            {selectedDepartment !== 'all' 
              ? `No dashboards found for ${selectedDepartment} department.`
              : 'Get started by creating your first digital signage dashboard.'
            }
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors">
            <Plus className="w-4 h-4" />
            Create Your First Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default NovaTVDashboard;
