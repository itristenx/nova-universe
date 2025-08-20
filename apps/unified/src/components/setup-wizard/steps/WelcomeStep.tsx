import React from 'react';
import { 
  Rocket, 
  CheckCircle, 
  Clock, 
  Users, 
  Database, 
  MessageSquare,
  Monitor,
  HardDrive,
  Brain,
  Shield,
  Sparkles
} from 'lucide-react';

export interface WelcomeStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

const features = [
  {
    icon: Users,
    title: 'Organization Setup',
    description: 'Configure your organization details and branding',
    estimatedTime: '5 min',
    required: true,
  },
  {
    icon: Shield,
    title: 'Administrator Account',
    description: 'Create your first admin user account',
    estimatedTime: '3 min',
    required: true,
  },
  {
    icon: Database,
    title: 'Database Configuration',
    description: 'Connect to your PostgreSQL database',
    estimatedTime: '5 min',
    required: true,
  },
  {
    icon: MessageSquare,
    title: 'Communications',
    description: 'Set up email, Slack, and other messaging',
    estimatedTime: '8 min',
    required: false,
  },
  {
    icon: Monitor,
    title: 'Monitoring & Alerting',
    description: 'Configure Nova Sentinel and GoAlert integration',
    estimatedTime: '10 min',
    required: false,
  },
  {
    icon: HardDrive,
    title: 'File Storage',
    description: 'Set up S3-compatible storage for files',
    estimatedTime: '5 min',
    required: false,
  },
  {
    icon: Brain,
    title: 'AI Features',
    description: 'Enable AI-powered assistance and automation',
    estimatedTime: '7 min',
    required: false,
  },
  {
    icon: Shield,
    title: 'Security Settings',
    description: 'Configure authentication and security policies',
    estimatedTime: '6 min',
    required: true,
  },
];

const Badge: React.FC<{ children: React.ReactNode; variant?: string; size?: string; className?: string }> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant as keyof typeof variantClasses]} ${className}`}>
      {children}
    </span>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  updateConfig,
}) => {
  const totalTime = features.reduce((acc, feature) => acc + parseInt(feature.estimatedTime), 0);
  const requiredFeatures = features.filter(f => f.required);
  const optionalFeatures = features.filter(f => !f.required);

  React.useEffect(() => {
    // Initialize welcome step config
    updateConfig({
      welcomeCompleted: true,
      setupStartTime: Date.now(),
    });
  }, [updateConfig]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Nova Universe
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
          Let's get your IT Service Management platform configured and ready to go. 
          This setup wizard will guide you through all the essential configuration steps.
        </p>

        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>≈ {totalTime} minutes total</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{requiredFeatures.length} required steps</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{optionalFeatures.length} optional features</span>
          </div>
        </div>
      </div>

      {/* Setup Overview */}
      <Card>
        <CardContent>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What We'll Configure
          </h3>
          
          <div className="space-y-4">
            {/* Required Steps */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-500" />
                Required Configuration
              </h4>
              <div className="grid gap-3">
                {requiredFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Icon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {feature.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">Required</Badge>
                        <Badge variant="outline">{feature.estimatedTime}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Features */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Optional Features
              </h4>
              <div className="grid gap-3">
                {optionalFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Icon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {feature.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Optional</Badge>
                        <Badge variant="outline">{feature.estimatedTime}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardContent>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Before We Begin
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>You can skip optional features and configure them later in the admin panel</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>Your progress is automatically saved - you can resume setup anytime</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>All configuration can be changed after the initial setup is complete</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>We'll test connections in real-time to ensure everything works correctly</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
