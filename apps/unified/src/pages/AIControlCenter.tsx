import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
  CpuChipIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

import { PredictiveAnalyticsDashboard } from '../components/ai/PredictiveAnalyticsDashboard';
import { IntelligentTicketClassification } from '../components/ai/IntelligentTicketClassification';
import { SmartKnowledgeBase } from '../components/ai/SmartKnowledgeBase';
import { WorkflowAutomationEngine } from '../components/ai/WorkflowAutomationEngine';
import { AIChatbot } from '../components/ai/AIChatbot';

type AIFeature = 'analytics' | 'classification' | 'knowledge' | 'automation' | 'chatbot';

interface FeatureCard {
  id: AIFeature;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleKey: string;
  descriptionKey: string;
  component: React.ComponentType;
}

const AI_FEATURES: FeatureCard[] = [
  {
    id: 'analytics',
    icon: ChartBarIcon,
    titleKey: 'ai.features.analytics.title',
    descriptionKey: 'ai.features.analytics.description',
    component: PredictiveAnalyticsDashboard,
  },
  {
    id: 'classification',
    icon: CpuChipIcon,
    titleKey: 'ai.features.classification.title',
    descriptionKey: 'ai.features.classification.description',
    component: IntelligentTicketClassification,
  },
  {
    id: 'knowledge',
    icon: DocumentMagnifyingGlassIcon,
    titleKey: 'ai.features.knowledge.title',
    descriptionKey: 'ai.features.knowledge.description',
    component: SmartKnowledgeBase,
  },
  {
    id: 'automation',
    icon: CogIcon,
    titleKey: 'ai.features.automation.title',
    descriptionKey: 'ai.features.automation.description',
    component: WorkflowAutomationEngine,
  },
  {
    id: 'chatbot',
    icon: ChatBubbleLeftRightIcon,
    titleKey: 'ai.features.chatbot.title',
    descriptionKey: 'ai.features.chatbot.description',
    component: AIChatbot,
  },
];

const AIControlCenter: React.FC = () => {
  const { t } = useTranslation(['common', 'ai']);
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);

  const renderActiveComponent = () => {
    if (!activeFeature) return null;

    const feature = AI_FEATURES.find((f) => f.id === activeFeature);
    if (!feature) return null;

    const Component = feature.component;
    return (
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
              <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t(feature.titleKey)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(feature.descriptionKey)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFeature(null)}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            title={t('common:close')}
          >
            ✕
          </button>
        </div>
        <Component />
      </div>
    );
  };

  if (activeFeature) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">{renderActiveComponent()}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-opacity-20 rounded-full bg-white p-3">
                <SparklesIcon className="h-12 w-12" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold">{t('ai:controlCenter.title')}</h1>
            <p className="mx-auto max-w-3xl text-xl text-purple-100">
              {t('ai:controlCenter.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {AI_FEATURES.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="transform cursor-pointer rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="p-6">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-center text-xl font-semibold text-gray-900 dark:text-white">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {t(feature.descriptionKey)}
                  </p>
                  <div className="mt-6 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFeature(feature.id);
                      }}
                      className="inline-flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                    >
                      <BeakerIcon className="h-4 w-4" />
                      <span>{t('ai:controlCenter.explore')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('ai:controlCenter.stats.title')}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-purple-600 dark:text-purple-400">5</div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('ai:controlCenter.stats.features')}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('ai:controlCenter.stats.availability')}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('ai:controlCenter.stats.accuracy')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIControlCenter;
