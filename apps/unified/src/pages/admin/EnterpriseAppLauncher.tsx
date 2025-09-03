import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ExternalLinkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuthStore } from '@stores/auth';
import enhancedAppSwitcherService, { type CustomApp } from '@services/enhancedAppSwitcher';

interface AppFormData {
  name: string;
  description: string;
  url: string;
  iconUrl: string;
  color: string;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

export default function EnterpriseAppLauncher() {
  const { user } = useAuthStore();
  const [apps, setApps] = useState<CustomApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<CustomApp | null>(null);
  const [formData, setFormData] = useState<AppFormData>({
    name: '',
    description: '',
    url: '',
    iconUrl: '',
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const allApps = await enhancedAppSwitcherService.getAllApps();
      // Filter to only show external apps for simplicity
      setApps(allApps.filter(app => app.type === 'external'));
    } catch (error) {
      console.error('Failed to load apps:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (app?: CustomApp) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        name: app.name,
        description: app.description,
        url: app.url,
        iconUrl: app.iconUrl || '',
        color: app.color,
      });
    } else {
      setEditingApp(null);
      setFormData({
        name: '',
        description: '',
        url: '',
        iconUrl: '',
        color: PRESET_COLORS[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingApp(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      const appData = {
        name: formData.name,
        description: formData.description,
        url: formData.url,
        type: 'external' as const,
        iconUrl: formData.iconUrl || undefined,
        color: formData.color,
        ssoEnabled: false,
        newWindow: true, // Always open in new window for enterprise apps
      };

      if (editingApp) {
        await enhancedAppSwitcherService.updateCustomApp(editingApp.id, appData);
        toast.success('Application updated successfully');
      } else {
        await enhancedAppSwitcherService.createCustomApp(appData);
        toast.success('Application created successfully');
      }

      closeModal();
      loadApps();
    } catch (error) {
      console.error('Failed to save app:', error);
      toast.error('Failed to save application');
    }
  };

  const handleDelete = async (app: CustomApp) => {
    if (!confirm(`Are you sure you want to delete "${app.name}"?`)) {
      return;
    }

    try {
      await enhancedAppSwitcherService.deleteCustomApp(app.id);
      toast.success('Application deleted successfully');
      loadApps();
    } catch (error) {
      console.error('Failed to delete app:', error);
      toast.error('Failed to delete application');
    }
  };

  const launchApp = (app: CustomApp) => {
    // Track usage and launch in new window
    enhancedAppSwitcherService.trackAppAccess(app.id, user?.id ?? 'anonymous');
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise App Launcher</h1>
          <p className="text-gray-600 mt-1">
            Manage custom applications that open in new browser windows
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Application
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12">
          <ExternalLinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first custom application.
          </p>
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Application
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {app.iconUrl ? (
                    <img 
                      src={app.iconUrl} 
                      alt={app.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{app.name}</h3>
                    <p className="text-xs text-gray-500">External App</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openModal(app)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit application"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(app)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete application"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>
              
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">URL:</p>
                <p className="text-xs text-gray-700 truncate" title={app.url}>{app.url}</p>
              </div>

              <button
                onClick={() => launchApp(app)}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Launch App
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingApp ? 'Edit Application' : 'Add New Application'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Application Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Salesforce"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the application"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Application URL *
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700">
                    Icon URL (optional)
                  </label>
                  <input
                    type="url"
                    id="iconUrl"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/icon.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Color
                  </label>
                  <div className="flex space-x-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingApp ? 'Update' : 'Create'} Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}