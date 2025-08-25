/**
 * Configuration Management Component
 *
 * Comprehensive configuration management for all Nova ITSM settings
 * Categorized interface for easy administration
 */

import React, { useState, useEffect } from 'react';
import './ConfigurationManagement.css';

interface ConfigValue {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array';
  description?: string;
  category: string;
  required?: boolean;
  sensitive?: boolean;
}

interface ConfigCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  values: Record<string, any>;
}

const ConfigurationManagement = () => {
  const [categories, setCategories] = useState<ConfigCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('organization');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const configCategories: ConfigCategory[] = [
    {
      id: 'organization',
      name: 'Organization',
      description: 'Basic organization information and branding',
      icon: '🏢',
      values: {},
    },
    {
      id: 'messages',
      name: 'Messages',
      description: 'Welcome messages and status text',
      icon: '💬',
      values: {},
    },
    {
      id: 'features',
      name: 'Features',
      description: 'Enable/disable application features',
      icon: '🎛️',
      values: {},
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Security settings and policies',
      icon: '🔒',
      values: {},
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Email configuration and templates',
      icon: '📧',
      values: {},
    },
    {
      id: 'upload',
      name: 'File Upload',
      description: 'File upload settings and limits',
      icon: '📁',
      values: {},
    },
    {
      id: 'system',
      name: 'System',
      description: 'System settings and URLs',
      icon: '⚙️',
      values: {},
    },
  ];

  const configDescriptions: Record<string, string> = {
    // Organization
    organization_name: 'The name of your organization displayed throughout the application',
    company_name: 'Official company name for formal communications',
    logo_url: 'URL path to your organization logo (e.g., /logo.png)',
    favicon_url: 'URL path to your favicon (e.g., /favicon.ico)',
    primary_color: 'Primary brand color (hex code)',
    secondary_color: 'Secondary brand color (hex code)',
    welcome_message: 'Welcome message shown to users',
    help_message: 'Help message displayed on support forms',

    // Messages
    status_open_msg: 'Message for open ticket status',
    status_closed_msg: 'Message for closed ticket status',
    status_error_msg: 'Message for error status',
    status_meeting_msg: 'Message for meeting status',
    status_brb_msg: 'Message for "be right back" status',
    status_lunch_msg: 'Message for lunch break status',
    status_unavailable_msg: 'Message for unavailable status',

    // Email
    support_email: 'Support team email address',
    from_email: 'Default sender email address',
    from_name: 'Default sender name',
    email_tracking_enabled: 'Enable email tracking and analytics',
    email_tracking_domain: 'Domain for email tracking links',

    // Security
    rate_limit_window: 'Rate limiting time window (milliseconds)',
    rate_limit_max: 'Maximum requests per window',
    min_pin_length: 'Minimum PIN length for users',
    max_pin_length: 'Maximum PIN length for users',

    // Upload
    upload_max_file_size: 'Maximum file upload size (bytes)',
    upload_allowed_types: 'Allowed file extensions (comma-separated)',

    // Features
    cosmo_enabled: 'Enable Cosmo AI assistant',
    cosmo_xp_enabled: 'Enable Cosmo experience points',
    mcp_enabled: 'Enable Model Context Protocol',
    ai_ticket_processing_enabled: 'Enable AI-powered ticket processing',
    ai_duplicate_detection_enabled: 'Enable AI duplicate ticket detection',
    ai_trend_analysis_enabled: 'Enable AI trend analysis',
    ml_sentiment_analysis_enabled: 'Enable sentiment analysis for tickets',
    ml_language_detection_enabled: 'Enable automatic language detection',
    directory_enabled: 'Enable directory integration',
    input_sanitization_enabled: 'Enable input sanitization',
    field_redaction_enabled: 'Enable sensitive field redaction',

    // System
    base_url: 'Base URL for the application',
    api_url: 'API base URL',
    public_url: 'Public facing URL',
    backup_retention_days: 'Number of days to retain backups',
    health_check_interval: 'Health check interval (milliseconds)',
    log_level: 'Application log level (error, warn, info, debug)',
  };

  useEffect(() => {
    loadAllConfiguration();
  }, []);

  const loadAllConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/config/categories/all', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data;

        // Update categories with loaded data
        const updatedCategories = configCategories.map((category) => ({
          ...category,
          values: data[category.id] || {},
        }));

        setCategories(updatedCategories);
        setEditingValues(data[selectedCategory] || {});
      } else {
        console.error('Failed to load configuration');
      }
    } catch (_error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    if (
      hasChanges &&
      !confirm('You have unsaved changes. Are you sure you want to switch categories?')
    ) {
      return;
    }

    setSelectedCategory(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    setEditingValues(category?.values || {});
    setHasChanges(false);
  };

  const handleValueChange = (key: string, value: any) => {
    setEditingValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/config/categories/${selectedCategory}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: editingValues }),
      });

      if (response.ok) {
        // Update the category values
        setCategories((prev) =>
          prev.map((category) =>
            category.id === selectedCategory ? { ...category, values: editingValues } : category,
          ),
        );

        setHasChanges(false);
        alert('Configuration saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
      }
    } catch (_error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your changes?')) {
      const category = categories.find((c) => c.id === selectedCategory);
      setEditingValues(category?.values || {});
      setHasChanges(false);
    }
  };

  const renderValue = (key: string, value: any) => {
    const description = configDescriptions[key] || 'No description available';

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="config-item">
          <div className="config-item-header">
            <label className="config-label">
              <input
                type="checkbox"
                checked={editingValues[key] ?? value}
                onChange={(e) => handleValueChange(key, e.target.checked)}
                className="config-checkbox"
              />
              <span className="config-key">
                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </label>
          </div>
          <p className="config-description">{description}</p>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={key} className="config-item">
          <div className="config-item-header">
            <label className="config-label">
              {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
          </div>
          <input
            type="number"
            value={editingValues[key] ?? value}
            onChange={(e) => handleValueChange(key, parseInt(e.target.value) || 0)}
            className="config-input"
          />
          <p className="config-description">{description}</p>
        </div>
      );
    }

    // String input
    return (
      <div key={key} className="config-item">
        <div className="config-item-header">
          <label className="config-label">
            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
        </div>
        {key.includes('message') || key.includes('description') ? (
          <textarea
            value={editingValues[key] ?? value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            className="config-textarea"
            rows={3}
          />
        ) : (
          <input
            type="text"
            value={editingValues[key] ?? value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            className="config-input"
          />
        )}
        <p className="config-description">{description}</p>
      </div>
    );
  };

  const filteredValues = () => {
    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return {};

    const values = category.values;
    if (!searchTerm) return values;

    const filtered: Record<string, any> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        configDescriptions[key]?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        filtered[key] = value;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="config-container">
        <div className="config-loading">
          <div className="spinner"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  const currentCategory = configCategories.find((c) => c.id === selectedCategory);
  const values = filteredValues();

  return (
    <div className="config-container">
      <div className="config-header">
        <h1 className="config-title">Configuration Management</h1>
        <p className="config-description">Manage application settings and configuration</p>
      </div>

      <div className="config-layout">
        {/* Category Sidebar */}
        <div className="config-sidebar">
          <div className="config-search">
            <input
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="config-categories">
            {configCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              >
                <span className="category-icon">{category.icon}</span>
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-description">{category.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Content */}
        <div className="config-content">
          <div className="config-content-header">
            <div className="config-section-info">
              <h2 className="config-section-title">
                <span className="section-icon">{currentCategory?.icon}</span>
                {currentCategory?.name}
              </h2>
              <p className="config-section-description">{currentCategory?.description}</p>
            </div>

            {hasChanges && (
              <div className="config-actions">
                <button onClick={handleReset} disabled={saving} className="btn btn-secondary">
                  Reset
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="config-items">
            {Object.keys(values).length === 0 ? (
              <div className="config-empty">
                <p>No configuration items found{searchTerm ? ' matching your search' : ''}.</p>
              </div>
            ) : (
              Object.entries(values).map(([key, value]) => renderValue(key, value))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManagement;
