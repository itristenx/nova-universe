/**
 * Cosmo Greeting Component
 * Dynamic greeting and personality display for Cosmo AI
 */
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import CosmoAvatar from './CosmoAvatar';
import AIIndicator from './AIIndicator';

interface CosmoGreetingProps {
  userName?: string;
  context?: 'pulse' | 'orbit' | 'comms' | 'beacon';
  compact?: boolean;
  className?: string;
}

export function CosmoGreeting({ 
  userName, 
  context = 'orbit', 
  compact = false,
  className = '' 
}: CosmoGreetingProps) {
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Cosmo's personality-driven greetings based on context
  const greetings = {
    pulse: [
      "🚀 Ready to resolve that ticket?",
      "Let's tackle some tickets together!",
      "🔧 What can we fix today?",
      "Time to make some IT magic happen!"
    ],
    orbit: [
      "Hey there 👋 need help creating a new request?",
      "Welcome to your service universe!",
      "I'm here to help you navigate Nova!",
      "What brings you to the help desk today?"
    ],
    comms: [
      "📨 Ready to streamline some communications?",
      "Let's get your team connected!",
      "Time to sync up with your team!",
      "Communication is key - how can I help?"
    ],
    beacon: [
      "🏢 Welcome to your workspace portal!",
      "Let's get you set up and running!",
      "Your digital workspace awaits!",
      "Ready to boost your productivity?"
    ]
  };

  // XP and encouragement messages
  const encouragementMessages = [
    "🌟 You just earned an XP boost for solving that in under 5 mins!",
    "Heads up, this looks urgent — shall we prioritize it?",
    "Great work! You're becoming a Nova expert!",
    "✅ Another one solved! You're on fire today!"
  ];

  useEffect(() => {
    const contextGreetings = greetings[context];
    const randomGreeting = contextGreetings[Math.floor(Math.random() * contextGreetings.length)];
    setCurrentGreeting(randomGreeting);
    
    // Randomly show encouragement messages (20% chance)
    setShowEncouragement(Math.random() < 0.2);
  }, [context]);

  const getPersonalizedGreeting = () => {
    if (userName) {
      return `Hi ${userName}! ${currentGreeting}`;
    }
    return currentGreeting;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <CosmoAvatar size="sm" />
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Cosmo</span>
          <AIIndicator type="cosmo" size="xs" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-blue-100 dark:border-gray-600 ${className}`}>
      <div className="flex items-start space-x-3">
        <CosmoAvatar size="md" animate={true} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              I'm Cosmo!
            </h3>
            <AIIndicator type="cosmo" size="sm" />
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {getPersonalizedGreeting()}
          </p>
          
          {showEncouragement && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                {encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]}
              </p>
            </div>
          )}
          
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <SparklesIcon className="w-3 h-3" />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CosmoGreeting;