import React from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Button } from '../../ui/Button';

interface WelcomeStepProps {
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
  onUpdate: (data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onComplete
}) => {
  React.useEffect(() => {
    // Auto-complete the welcome step after a short delay
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <SparklesIcon className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome to the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nova Universe</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your entire service galaxy. Let's get your enterprise-grade service platform configured and ready to launch.
          </p>
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-2xl">🛸</span>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Nova Orbit</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">End-user portal for ticket submission and knowledge base</p>
        </div>

        <div className="p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800">
          <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-2xl">🛰️</span>
          </div>
          <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-2">Nova Pulse</h3>
          <p className="text-cyan-700 dark:text-cyan-300 text-sm">Technician workspace with advanced workflow automation</p>
        </div>

        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-2xl">🧠</span>
          </div>
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Cosmo AI</h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm">Intelligent assistant for automated workflows and insights</p>
        </div>
      </div>

      {/* Setup Info */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 max-w-2xl mx-auto">
        <div className="flex items-start space-x-4">
          <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What we'll set up together:</h3>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Your organization details and branding</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Administrator account and security settings</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Database and service integrations</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Email notifications and authentication</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Estimated Time */}
      <div className="text-center">
        <p className="text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center space-x-2">
            <span>⏱️</span>
            <span>Estimated setup time: 5-10 minutes</span>
          </span>
        </p>
      </div>
    </div>
  );
};
