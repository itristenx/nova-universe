import React from 'react';
import { CheckCircleIcon, RocketLaunchIcon, CogIcon } from '@heroicons/react/24/solid';
import { Button } from '../../ui/Button';

interface CompletionStepProps {
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
  onUpdate: (data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  onComplete,
  isLoading
}) => {
  const [deploymentStatus, setDeploymentStatus] = React.useState<'pending' | 'deploying' | 'complete' | 'error'>('pending');
  const [deploymentStep, setDeploymentStep] = React.useState('');

  const handleFinishSetup = async () => {
    setDeploymentStatus('deploying');
    
    const steps = [
      'Creating database tables...',
      'Configuring services...',
      'Setting up admin account...',
      'Applying organization settings...',
      'Initializing modules...',
      'Starting services...',
      'Validating setup...'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setDeploymentStep(steps[i]);
        
        // Simulate deployment step
        await new Promise(resolve => setTimeout(resolve, 1000)); // TODO-LINT: move to async function
        
        // In real implementation, make actual API calls here
        if (i === 0) {
          await fetch('/api/setup/initialize-database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }); // TODO-LINT: move to async function
        }
        
        if (i === 1) {
          await fetch('/api/setup/configure-services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }); // TODO-LINT: move to async function
        }
        
        if (i === 2) {
          await fetch('/api/setup/create-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.admin)
          }); // TODO-LINT: move to async function
        }
        
        if (i === 3) {
          await fetch('/api/setup/apply-organization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.organization)
          }); // TODO-LINT: move to async function
        }
      }
      
      setDeploymentStatus('complete');
      
      // Clear setup progress from localStorage
      localStorage.removeItem('nova-setup-progress');
      
      // Wait a moment then complete
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Setup failed:', error);
      setDeploymentStatus('error');
      setDeploymentStep('Setup failed. Please check the configuration and try again.');
    }
  };

  const getAccessUrls = () => {
    const baseUrl = window.location.origin;
    return {
      admin: `${baseUrl}/admin`,
      orbit: `${baseUrl}/orbit`,
      pulse: `${baseUrl}/pulse`,
      api: `${baseUrl}/api`
    };
  };

  const urls = getAccessUrls();
  const orgName = data?.organization?.name || 'Nova Universe';

  if (deploymentStatus === 'deploying') {
    return (
      <div className="text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
          <CogIcon className="w-12 h-12 text-white animate-spin" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Setting Up {orgName}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Please wait while we configure your Nova Universe platform...
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
              {deploymentStep}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (deploymentStatus === 'error') {
    return (
      <div className="text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">❌</span>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Setup Failed
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            There was an error setting up your Nova Universe platform.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-red-700 dark:text-red-300 text-center">
            {deploymentStep}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setDeploymentStatus('pending');
            setDeploymentStep('');
          }}
          className="px-8"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (deploymentStatus === 'complete') {
    return (
      <div className="text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            🎉 Welcome to your Nova Universe!
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Your {orgName} platform is now ready for action.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href={urls.admin}
                className="block p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛰️</span>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Admin Portal</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage your platform</p>
                  </div>
                </div>
              </a>
              
              <a
                href={urls.orbit}
                className="block p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛸</span>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Nova Orbit</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">End-user portal</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Next Steps</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Invite your team members</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Configure ticket categories</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Set up integrations</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Customize branding</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onComplete}
          className="px-8 py-3 text-lg"
        >
          Launch Nova Universe
        </Button>
      </div>
    );
  }

  // Initial completion view
  return (
    <div className="text-center space-y-8">
      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
        <RocketLaunchIcon className="w-12 h-12 text-white" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Ready for Launch! 🚀
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Everything looks great! Let's deploy your {orgName} Nova Universe platform 
          and get your team connected to the galaxy of possibilities.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 max-w-2xl mx-auto text-left">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
          Configuration Summary
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Organization</h4>
              <p className="text-slate-600 dark:text-slate-400">{data?.organization?.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Administrator</h4>
              <p className="text-slate-600 dark:text-slate-400">
                {data?.admin?.firstName} {data?.admin?.lastName}
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">{data?.admin?.email}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Database</h4>
              <p className="text-slate-600 dark:text-slate-400 capitalize">{data?.database?.type}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Services</h4>
              <div className="text-slate-600 dark:text-slate-400 text-sm space-y-1">
                {data?.authentication?.enableSSO && <div>✓ SSO Authentication</div>}
                {data?.email?.provider && data?.email?.provider !== 'console' && <div>✓ Email Notifications</div>}
                {data?.services?.enableSlack && <div>✓ Slack Integration</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={handleFinishSetup}
          disabled={isLoading}
          isLoading={isLoading}
          className="px-12 py-3 text-lg"
        >
          Deploy Nova Universe
        </Button>
      </div>
    </div>
  );
};
