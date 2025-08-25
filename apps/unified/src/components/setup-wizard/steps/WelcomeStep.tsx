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
  Sparkles,
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

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: string;
  size?: string;
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variantClasses[variant as keyof typeof variantClasses]} ${className}`}
    >
      {children}
    </span>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-6 ${className}`}>{children}</div>;

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ updateConfig }) => {
  const totalTime = features.reduce((acc, feature) => acc + parseInt(feature.estimatedTime), 0);
  const requiredFeatures = features.filter((f) => f.required);
  const optionalFeatures = features.filter((f) => !f.required);

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
      <div className="py-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <Rocket className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Nova Universe
        </h2>

        <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Let's get your IT Service Management platform configured and ready to go. This setup
          wizard will guide you through all the essential configuration steps.
        </p>

        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>≈ {totalTime} minutes total</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>{requiredFeatures.length} required steps</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{optionalFeatures.length} optional features</span>
          </div>
        </div>
      </div>

      {/* Setup Overview */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            What We'll Configure
          </h3>

          <div className="space-y-4">
            {/* Required Steps */}
            <div>
              <h4 className="mb-3 flex items-center text-lg font-medium text-gray-900 dark:text-white">
                <Shield className="mr-2 h-5 w-5 text-red-500" />
                Required Configuration
              </h4>
              <div className="grid gap-3">
                {requiredFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
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
              <h4 className="mb-3 flex items-center text-lg font-medium text-gray-900 dark:text-white">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Optional Features
              </h4>
              <div className="grid gap-3">
                {optionalFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
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
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardContent>
          <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
            Before We Begin
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
              <span>
                You can skip optional features and configure them later in the admin panel
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
              <span>Your progress is automatically saved - you can resume setup anytime</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
              <span>All configuration can be changed after the initial setup is complete</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
              <span>We'll test connections in real-time to ensure everything works correctly</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
