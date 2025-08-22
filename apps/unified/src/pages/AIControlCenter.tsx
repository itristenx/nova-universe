import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
  CpuChipIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'

import { PredictiveAnalyticsDashboard } from '../components/ai/PredictiveAnalyticsDashboard'
import { IntelligentTicketClassification } from '../components/ai/IntelligentTicketClassification'
import { SmartKnowledgeBase } from '../components/ai/SmartKnowledgeBase'
import { WorkflowAutomationEngine } from '../components/ai/WorkflowAutomationEngine'
import { AIChatbot } from '../components/ai/AIChatbot'

type AIFeature = 'analytics' | 'classification' | 'knowledge' | 'automation' | 'chatbot'

interface FeatureCard {
  id: AIFeature
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  titleKey: string
  descriptionKey: string
  component: React.ComponentType
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
]

const AIControlCenter: React.FC = () => {
  const { t } = useTranslation(['common', 'ai'])
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null)

  const renderActiveComponent = () => {
    if (!activeFeature) return null
    
    const feature = AI_FEATURES.find(f => f.id === activeFeature)
    if (!feature) return null

    const Component = feature.component
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={t('common:close')}
          >
            ✕
          </button>
        </div>
        <Component />
      </div>
    )
  }

  if (activeFeature) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {renderActiveComponent()}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <SparklesIcon className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {t('ai:controlCenter.title')}
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              {t('ai:controlCenter.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AI_FEATURES.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div
                key={feature.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl mb-6 mx-auto">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center text-sm leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                  <div className="mt-6 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveFeature(feature.id)
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <BeakerIcon className="w-4 h-4" />
                      <span>{t('ai:controlCenter.explore')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('ai:controlCenter.stats.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                5
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('ai:controlCenter.stats.features')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('ai:controlCenter.stats.availability')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
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
  )
}

export default AIControlCenter
