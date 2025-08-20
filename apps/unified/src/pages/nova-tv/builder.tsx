import React, { useState, useEffect } from 'react';
import { 
  Type, 
  BarChart3, 
  Image, 
  Clock, 
  Megaphone,
  Settings,
  Layout,
  Eye,
  Save,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { novaTVService, Dashboard } from '../../services/nova-tv';

interface ContentBlock {
  id: string;
  type: string;
  title: string;
  config: any;
  displayOrder: number;
}

const DashboardBuilder: React.FC = () => {
  const [dashboard, setDashboard] = useState<Partial<Dashboard> | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
    initializeDashboard();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await novaTVService.getTemplates();
      console.log('Templates loaded:', data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const initializeDashboard = () => {
    // Initialize with a new dashboard
    setDashboard({
      name: 'New Dashboard',
      description: '',
      department: 'IT',
      isActive: false,
      isPublic: false,
      configuration: {
        refreshInterval: 30,
        theme: 'light',
        layout: 'grid'
      }
    });
    setLoading(false);
  };

  const addContentBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      config: getDefaultConfig(type),
      displayOrder: contentBlocks.length
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const getDefaultTitle = (type: string): string => {
    switch (type) {
      case 'text': return 'Text Block';
      case 'metrics': return 'Live Metrics';
      case 'announcements': return 'Announcements';
      case 'clock': return 'Current Time';
      case 'image': return 'Image Display';
      case 'chart': return 'Chart Widget';
      default: return 'Content Block';
    }
  };

  const getDefaultConfig = (type: string): any => {
    switch (type) {
      case 'text':
        return {
          content: 'Enter your text here...',
          fontSize: 'medium',
          alignment: 'left',
          color: '#000000'
        };
      case 'metrics':
        return {
          dataSource: 'tickets',
          department: 'all',
          metricType: 'count',
          refreshInterval: 60
        };
      case 'announcements':
        return {
          department: 'all',
          priority: 'all',
          maxItems: 5,
          autoScroll: true
        };
      case 'clock':
        return {
          format: '12hour',
          showDate: true,
          timezone: 'local',
          style: 'digital'
        };
      case 'image':
        return {
          url: '',
          alt: 'Dashboard image',
          fit: 'cover',
          autoRotate: false
        };
      case 'chart':
        return {
          chartType: 'bar',
          dataSource: 'tickets',
          timeRange: '24h',
          groupBy: 'department'
        };
      default:
        return {};
    }
  };

  const removeContentBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  const editContentBlock = (id: string) => {
    const block = contentBlocks.find(b => b.id === id);
    if (block) {
      // For now, we'll just show the block title for editing
      // In a full implementation, this would open a modal with the block's configuration
      const newTitle = prompt('Edit block title:', block.title);
      if (newTitle && newTitle.trim()) {
        setContentBlocks(contentBlocks.map(b => 
          b.id === id ? { ...b, title: newTitle.trim() } : b
        ));
      }
    }
  };

  const saveDashboard = async () => {
    if (!dashboard) return;
    
    try {
      setLoading(true);
      
      // Create or update dashboard
      const savedDashboard = dashboard.id 
        ? await novaTVService.updateDashboard(dashboard.id, dashboard)
        : await novaTVService.createDashboard(dashboard as Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>);
      
      // Save content blocks
      for (const block of contentBlocks) {
        const contentData = {
          dashboardId: savedDashboard.id,
          contentType: block.type,
          title: block.title,
          contentData: block.config,
          displayOrder: block.displayOrder,
          isActive: true,
          metadata: {}
        };
        
        await novaTVService.createContent(contentData);
      }
      
      setDashboard(savedDashboard);
      
      // Show success message (you could add a toast notification here)
      alert('Dashboard saved successfully!');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('Failed to save dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contentTypes = [
    { type: 'text', icon: Type, label: 'Text Block' },
    { type: 'metrics', icon: BarChart3, label: 'Live Metrics' },
    { type: 'announcements', icon: Megaphone, label: 'Announcements' },
    { type: 'clock', icon: Clock, label: 'Clock Widget' },
    { type: 'image', icon: Image, label: 'Image Display' },
    { type: 'chart', icon: BarChart3, label: 'Chart Widget' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Layout className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {dashboard?.name || 'Dashboard Builder'}
              </h1>
              <p className="text-sm text-gray-600">
                {dashboard?.department} • {contentBlocks.length} content blocks
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                previewMode
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </button>
            
            <button
              onClick={saveDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Content Types */}
        {!previewMode && (
          <div className="w-64 bg-white border-r p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Dashboard Settings</h3>
            
            {/* Basic Settings */}
            <div className="space-y-4 mb-6 pb-6 border-b">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dashboard Name
                </label>
                <input
                  type="text"
                  value={dashboard?.name || ''}
                  onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter dashboard name"
                  aria-label="Dashboard name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={dashboard?.department || 'IT'}
                  onChange={(e) => setDashboard(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Select department"
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Content</h3>
            
            {/* Content Types */}
            <div className="space-y-2">
              {contentTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => addContentBlock(type)}
                  className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Dashboard Preview */}
            <div className="bg-white rounded-lg shadow-sm border min-h-96">
              {contentBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Layout className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Dashboard
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add content blocks from the sidebar to create your digital signage display.
                  </p>
                  {!previewMode && (
                    <button
                      onClick={() => addContentBlock('text')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add First Block
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {contentBlocks.map((block) => (
                    <div
                      key={block.id}
                      className={`relative border-2 border-dashed border-gray-200 rounded-lg p-4 ${
                        previewMode ? 'border-transparent' : 'hover:border-gray-300'
                      }`}
                    >
                      {/* Content Block Header */}
                      {!previewMode && (
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                            <span className="text-sm font-medium text-gray-700">
                              {block.title}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {block.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => editContentBlock(block.id)}
                              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit block"
                              aria-label="Edit block"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeContentBlock(block.id)}
                              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove block"
                              aria-label="Remove block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Block Preview */}
                      <div className="min-h-24 bg-gray-50 rounded border flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <div className="text-lg font-medium mb-1">{block.title}</div>
                          <div className="text-sm opacity-75">
                            {block.type === 'text' && block.config.content}
                            {block.type === 'metrics' && `Live ${block.config.dataSource} metrics`}
                            {block.type === 'announcements' && 'Latest announcements feed'}
                            {block.type === 'clock' && 'Current time display'}
                            {block.type === 'image' && 'Image content'}
                            {block.type === 'chart' && `${block.config.chartType} chart`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilder;
