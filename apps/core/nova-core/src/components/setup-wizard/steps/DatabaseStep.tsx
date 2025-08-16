import React, { useState, useEffect } from 'react';
import {
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

interface DatabaseStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const DatabaseStep: React.FC<DatabaseStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    type: data?.database?.type || 'postgresql',
    host: data?.database?.host || 'localhost',
    port: data?.database?.port || 5432,
    database: data?.database?.database || 'nova_universe',
    username: data?.database?.username || '',
    password: data?.database?.password || '',
    path: data?.database?.path || './data/nova.db',
    ssl: data?.database?.ssl || false,
    autoMigrate: data?.database?.autoMigrate || true,
  });

  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let valid = false;

    if (formData.type === 'sqlite') {
      valid = formData.path.trim().length > 0;
    } else {
      valid =
        formData.host.trim().length > 0 &&
        formData.database.trim().length > 0 &&
        formData.username.trim().length > 0 &&
        formData.port > 0;
    }

    setIsValid(valid);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    onUpdate({
      database: newFormData,
    });

    // Reset connection status when config changes
    setConnectionStatus('idle');
    setConnectionError('');
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');

    try {
      const response = await fetch('/api/setup/test-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Failed to connect to database');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError('Unable to test connection. Please check your configuration.');
    }
  };

  const handleContinue = () => {
    if (isValid) {
      onComplete();
    }
  };

  const getDatabasePortPlaceholder = () => {
    switch (formData.type) {
      case 'postgresql':
        return '5432';
      case 'mysql':
        return '3306';
      case 'sqlite':
        return '';
      default:
        return '5432';
    }
  };

  const getConnectionString = () => {
    if (formData.type === 'sqlite') {
      return formData.path;
    }

    const protocol = formData.type === 'mysql' ? 'mysql' : 'postgresql';
    return `${protocol}://${formData.username}:****@${formData.host}:${formData.port}/${formData.database}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/20">
          <CircleStackIcon className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Database Configuration
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Connect Nova Universe to your database
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Database Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Database Type</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                type: 'postgresql',
                title: 'PostgreSQL',
                description: 'Recommended for production',
                icon: '🐘',
              },
              {
                type: 'mysql',
                title: 'MySQL',
                description: 'Popular relational database',
                icon: '🐬',
              },
              {
                type: 'sqlite',
                title: 'SQLite',
                description: 'Simple file-based database',
                icon: '📄',
              },
            ].map((db) => (
              <button
                key={db.type}
                onClick={() => handleInputChange('type', db.type)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  formData.type === db.type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <div className="mb-2 text-2xl">{db.icon}</div>
                <h4 className="font-medium text-slate-900 dark:text-white">{db.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{db.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Database Configuration */}
        {formData.type === 'sqlite' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              SQLite Configuration
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Database Path *
              </label>
              <Input
                value={formData.path}
                onChange={(e) => handleInputChange('path', e.target.value)}
                placeholder="./data/nova.db"
                error={errors.path}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Path to your SQLite database file (will be created if it doesn't exist)
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <h4 className="mb-1 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    SQLite Limitations
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    SQLite is great for development and small deployments, but consider PostgreSQL
                    or MySQL for production environments with multiple users or high traffic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {formData.type === 'mysql' ? 'MySQL' : 'PostgreSQL'} Configuration
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Host *
                </label>
                <Input
                  value={formData.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="localhost"
                  error={errors.host}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Port *
                </label>
                <Input
                  type="number"
                  value={formData.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 0)}
                  placeholder={getDatabasePortPlaceholder()}
                  error={errors.port}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Database Name *
              </label>
              <Input
                value={formData.database}
                onChange={(e) => handleInputChange('database', e.target.value)}
                placeholder="nova_universe"
                error={errors.database}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The database must already exist
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Username *
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="nova_user"
                  error={errors.username}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter database password"
                  error={errors.password}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="ssl"
                checked={formData.ssl}
                onChange={(e) => handleInputChange('ssl', e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <label htmlFor="ssl" className="text-sm text-slate-700 dark:text-slate-300">
                Use SSL connection
              </label>
            </div>
          </div>
        )}

        {/* Connection Test */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Connection Test
            </h3>
            <Button
              variant="bordered"
              onClick={testConnection}
              disabled={!isValid || connectionStatus === 'testing'}
              isLoading={connectionStatus === 'testing'}
            >
              Test Connection
            </Button>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div
              className={`rounded-lg p-4 ${
                connectionStatus === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : connectionStatus === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                {connectionStatus === 'success' && (
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600" />
                )}
                {connectionStatus === 'error' && (
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />
                )}
                <div className="flex-1">
                  <h4
                    className={`mb-1 text-sm font-medium ${
                      connectionStatus === 'success'
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}
                  >
                    {connectionStatus === 'success'
                      ? 'Connection Successful!'
                      : 'Connection Failed'}
                  </h4>
                  <p
                    className={`text-sm ${
                      connectionStatus === 'success'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {connectionStatus === 'success'
                      ? `Successfully connected to ${formData.type} database`
                      : connectionError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection String Preview */}
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Connection String Preview
            </h4>
            <code className="text-sm break-all text-slate-600 dark:text-slate-400">
              {getConnectionString()}
            </code>
          </div>
        </div>

        {/* Migration Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Migration Options
          </h3>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoMigrate"
              checked={formData.autoMigrate}
              onChange={(e) => handleInputChange('autoMigrate', e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="autoMigrate" className="text-sm text-slate-700 dark:text-slate-300">
              Automatically run database migrations
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This will create the necessary tables and schema for Nova Universe. Disable this if you
            want to run migrations manually.
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          className="px-8"
        >
          Configure Database
        </Button>
      </div>
    </div>
  );
};
