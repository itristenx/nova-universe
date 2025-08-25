import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  enhancedAppSwitcherService,
  type CustomApp,
  type AppAssignment,
} from '@services/enhancedAppSwitcher';

export function AppManagement() {
  const { t } = useTranslation(['admin']);
  const { addNotification } = useNotifications();
  const [apps, setApps] = useState<CustomApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<CustomApp | null>(null);
  const [assignments, setAssignments] = useState<AppAssignment[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    type: 'external' as const,
    iconUrl: '',
    color: 'bg-blue-600',
    ssoEnabled: false,
    newWindow: true,
    category: 'productivity',
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const allApps = await enhancedAppSwitcherService.getAllApps();
      setApps(allApps);
    } catch (_error) {
      console.error('Failed to load apps:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load applications',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (appId: string) => {
    try {
      const appAssignments = await enhancedAppSwitcherService.getAppAssignments(appId);
      setAssignments(appAssignments);
    } catch (_error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const handleCreateApp = async () => {
    try {
      await enhancedAppSwitcherService.createCustomApp(formData);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Application created successfully',
      });
      setShowCreateModal(false);
      resetForm();
      loadApps();
    } catch (_error) {
      console.error('Failed to create app:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create application',
      });
    }
  };

  const handleUpdateApp = async () => {
    if (!selectedApp) return;

    try {
      await enhancedAppSwitcherService.updateCustomApp(selectedApp.id, formData);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Application updated successfully',
      });
      setShowEditModal(false);
      setSelectedApp(null);
      resetForm();
      loadApps();
    } catch (_error) {
      console.error('Failed to update app:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update application',
      });
    }
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;

    try {
      await enhancedAppSwitcherService.deleteCustomApp(selectedApp.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Application deleted successfully',
      });
      setShowDeleteModal(false);
      setSelectedApp(null);
      loadApps();
    } catch (_error) {
      console.error('Failed to delete app:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete application',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      url: '',
      type: 'external',
      iconUrl: '',
      color: 'bg-blue-600',
      ssoEnabled: false,
      newWindow: true,
      category: 'productivity',
    });
  };

  const openEditModal = (app: CustomApp) => {
    setSelectedApp(app);
    setFormData({
      name: app.name,
      description: app.description,
      url: app.url,
      type: app.type,
      iconUrl: app.iconUrl || '',
      color: app.color,
      ssoEnabled: app.ssoEnabled || false,
      newWindow: app.newWindow || true,
      category: app.category || 'productivity',
    });
    setShowEditModal(true);
  };

  const openAssignmentModal = async (app: CustomApp) => {
    setSelectedApp(app);
    await loadAssignments(app.id);
    setShowAssignmentModal(true);
  };

  const getAppIcon = (app: CustomApp) => {
    if (app.iconUrl) {
      return <img src={app.iconUrl} alt={app.name} className="h-6 w-6" />;
    }

    switch (app.type) {
      case 'external':
        return <ArrowTopRightOnSquareIcon className="h-6 w-6 text-white" />;
      case 'saml':
        return <ShieldCheckIcon className="h-6 w-6 text-white" />;
      case 'oauth':
        return <GlobeAltIcon className="h-6 w-6 text-white" />;
      default:
        return <ArrowTopRightOnSquareIcon className="h-6 w-6 text-white" />;
    }
  };

  const colorOptions = [
    { value: 'bg-blue-600', label: 'Blue', color: 'bg-blue-600' },
    { value: 'bg-green-600', label: 'Green', color: 'bg-green-600' },
    { value: 'bg-purple-600', label: 'Purple', color: 'bg-purple-600' },
    { value: 'bg-red-600', label: 'Red', color: 'bg-red-600' },
    { value: 'bg-yellow-600', label: 'Yellow', color: 'bg-yellow-600' },
    { value: 'bg-pink-600', label: 'Pink', color: 'bg-pink-600' },
    { value: 'bg-indigo-600', label: 'Indigo', color: 'bg-indigo-600' },
    { value: 'bg-gray-600', label: 'Gray', color: 'bg-gray-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-2 h-3 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Application Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage custom applications and their assignments
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Application</span>
        </Button>
      </div>

      {/* Apps List */}
      <div className="space-y-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`h-12 w-12 rounded-lg ${app.color} flex items-center justify-center`}
                >
                  {getAppIcon(app)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{app.description}</p>
                  <div className="mt-2 flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        app.type === 'external'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : app.type === 'saml'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}
                    >
                      {app.type.toUpperCase()}
                    </span>
                    {app.ssoEnabled && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        SSO Enabled
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAssignmentModal(app)}
                  className="inline-flex items-center space-x-1"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Assignments</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(app)}
                  className="inline-flex items-center space-x-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApp(app);
                    setShowDeleteModal(true);
                  }}
                  className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedApp(null);
          resetForm();
        }}
        title={showCreateModal ? 'Add Application' : 'Edit Application'}
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Application Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter application name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <Select
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as any })}
                options={[
                  { value: 'external', label: 'External App' },
                  { value: 'saml', label: 'SAML SSO' },
                  { value: 'oauth', label: 'OAuth' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter application description"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL
            </label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              type="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon URL (Optional)
              </label>
              <Input
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                placeholder="https://example.com/icon.png"
                type="url"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-8 w-8 rounded-md ${color.color} flex items-center justify-center ${
                      formData.color === color.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    {formData.color === color.value && <CheckIcon className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.ssoEnabled}
                onChange={(e) => setFormData({ ...formData, ssoEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable SSO</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.newWindow}
                onChange={(e) => setFormData({ ...formData, newWindow: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Open in new window</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={showCreateModal ? handleCreateApp : handleUpdateApp}
              disabled={!formData.name || !formData.url}
            >
              {showCreateModal ? 'Create Application' : 'Update Application'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedApp(null);
        }}
        title="Delete Application"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete "{selectedApp?.name}"? This action cannot be undone
                and will remove all assignments.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteApp}>
              Delete Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assignments Modal */}
      <Modal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedApp(null);
          setAssignments([]);
        }}
        title={`Assignments - ${selectedApp?.name}`}
        className="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage who has access to this application
            </p>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Assignment
            </Button>
          </div>

          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {assignment.assignmentType === 'user' && (
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    )}
                    {assignment.assignmentType === 'group' && (
                      <UserGroupIcon className="h-5 w-5 text-green-600" />
                    )}
                    {assignment.assignmentType === 'department' && (
                      <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {assignment.assignmentName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {assignment.assignmentType.charAt(0).toUpperCase() +
                        assignment.assignmentType.slice(1)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No assignments configured
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AppManagement;
