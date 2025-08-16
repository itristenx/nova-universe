import React from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Button } from '../../ui/Button';

interface WelcomeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  React.useEffect(() => {
    // Auto-complete the welcome step after a short delay
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="space-y-8 text-center">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
          <SparklesIcon className="h-12 w-12 text-white" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome to the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nova Universe
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-300">
            Your entire service galaxy. Let's get your enterprise-grade service platform configured
            and ready to launch.
          </p>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-2xl text-white">🛸</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
            Nova Orbit
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            End-user portal for ticket submission and knowledge base
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6 dark:border-cyan-800 dark:bg-cyan-900/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
            <span className="text-2xl text-white">🛰️</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-cyan-900 dark:text-cyan-100">
            Nova Pulse
          </h3>
          <p className="text-sm text-cyan-700 dark:text-cyan-300">
            Technician workspace with advanced workflow automation
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
            <span className="text-2xl text-white">🧠</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-purple-900 dark:text-purple-100">
            Cosmo AI
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Intelligent assistant for automated workflows and insights
          </p>
        </div>
      </div>

      {/* Setup Info */}
      <div className="mx-auto max-w-2xl rounded-2xl bg-slate-50 p-6 dark:bg-slate-800">
        <div className="flex items-start space-x-4">
          <CheckCircleIcon className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
          <div className="text-left">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              What we'll set up together:
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                <span>Your organization details and branding</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                <span>Administrator account and security settings</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                <span>Database and service integrations</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
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
