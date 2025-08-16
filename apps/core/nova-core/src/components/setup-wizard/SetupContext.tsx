import React, { createContext, useContext, useReducer, useCallback } from 'react';

export interface SetupData {
  organization?: {
    name?: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    domain?: string;
    welcomeMessage?: string;
    helpMessage?: string;
    size?: string;
    industry?: string;
    timezone?: string;
  };
  admin?: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    username?: string;
    confirmPassword?: string;
  };
  database?: {
    type?: 'postgresql' | 'sqlite' | 'mysql';
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    path?: string;
    filename?: string;
    ssl?: boolean;
    autoMigrate?: boolean;
  };
  authentication?: {
    enableSSO?: boolean;
    ssoEnabled?: boolean;
    ssoProvider?: 'saml' | 'oauth' | 'ldap';
    ssoConfig?: any;
    ssoMetadataUrl?: string;
    ssoMetadataXml?: string;
    enableSCIM?: boolean;
    scimEnabled?: boolean;
    scimConfig?: any;
    scimToken?: string;
    scimBaseUrl?: string;
    sessionTimeout?: number;
    enableMFA?: boolean;
    requireMfa?: boolean;
    allowSelfRegistration?: boolean;
    maxLoginAttempts?: number;
    passwordPolicy?: {
      useCustomPolicy?: boolean;
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSymbols?: boolean;
    };
  };
  email?: {
    provider?: 'smtp' | 'sendgrid' | 'ses' | 'console';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
    secure?: boolean;
  };
  services?: {
    // Slack Integration
    slackEnabled?: boolean;
    slackToken?: string;
    slackChannel?: string;
    
    // Teams Integration
    teamsEnabled?: boolean;
    teamsWebhook?: string;
    
    // Webhooks
    webhooksEnabled?: boolean;
    webhookUrl?: string;
    webhookSecret?: string;
    
    // Search and Analytics
    elasticsearchEnabled?: boolean;
    elasticsearchUrl?: string;
    elasticsearchIndex?: string;
    
    analyticsEnabled?: boolean;
    analyticsProvider?: string;
    googleAnalyticsId?: string;
    
    // Monitoring
    sentryEnabled?: boolean;
    sentryDsn?: string;
    
    // File Storage
    storageProvider?: 'local' | 's3';
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
    
    // Knowledge Base and AI
    knowledgeBaseEnabled?: boolean;
    aiAssistEnabled?: boolean;
    openaiApiKey?: string;
    
    // Nova Sentinel Monitoring
    sentinelEnabled?: boolean;
    sentinelUrl?: string;
    sentinelApiKey?: string;
    sentinelWebhookSecret?: string;
    
    // GoAlert Alerting
    goalertEnabled?: boolean;
    goalertUrl?: string;
    goalertApiKey?: string;
    goalertSmtpHost?: string;
    goalertSmtpPort?: string;
    goalertSmtpUser?: string;
    goalertSmtpPass?: string;
  };
  branding?: {
    // Logo and Branding
    companyLogo?: File | null;
    companyName?: string;
    tagline?: string;
    
    // Colors
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    
    // Theme Options
    darkModeEnabled?: boolean;
    customThemeEnabled?: boolean;
    customCss?: string;
    
    // Portal Customization
    portalTitle?: string;
    portalSubtitle?: string;
    welcomeMessage?: string;
    
    // Footer and Links
    companyWebsite?: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    
    // Advanced
    customFavicon?: File | null;
    customFonts?: boolean;
    fontFamily?: string;
  };
}

interface SetupState {
  currentStep: number;
  setupData: SetupData;
  completedSteps: Set<string>;
  errors: Record<string, string>;
  isLoading: boolean;
  isTestMode: boolean;
}

type SetupAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_SETUP_DATA'; payload: Partial<SetupData> }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'SET_ERROR'; payload: { key: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TEST_MODE'; payload: boolean }
  | { type: 'RESET_SETUP' };

const initialState: SetupState = {
  currentStep: 0,
  setupData: {},
  completedSteps: new Set(),
  errors: {},
  isLoading: false,
  isTestMode: false,
};

function setupReducer(state: SetupState, action: SetupAction): SetupState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'UPDATE_SETUP_DATA':
      return {
        ...state,
        setupData: {
          ...state.setupData,
          ...action.payload,
        },
      };
    
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.message,
        },
      };
    
    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return { ...state, errors: newErrors };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_TEST_MODE':
      return { ...state, isTestMode: action.payload };
    
    case 'RESET_SETUP':
      return initialState;
    
    default:
      return state;
  }
}

interface SetupContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setupData: SetupData;
  updateSetupData: (data: Partial<SetupData>) => void;
  completedSteps: Set<string>;
  completeStep: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
  errors: Record<string, string>;
  setError: (key: string, message: string) => void;
  clearError: (key: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  isTestMode: boolean;
  setTestMode: (testMode: boolean) => void;
  resetSetup: () => void;
  validateStep: (stepId: string) => Promise<boolean>;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const useSetup = (): SetupContextType => {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
};

interface SetupProviderProps {
  children: React.ReactNode;
}

export const SetupProvider: React.FC<SetupProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(setupReducer, initialState);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const updateSetupData = useCallback((data: Partial<SetupData>) => {
    dispatch({ type: 'UPDATE_SETUP_DATA', payload: data });
    // Auto-save progress when data changes
    saveProgress();
  }, []);

  const completeStep = useCallback((stepId: string) => {
    dispatch({ type: 'COMPLETE_STEP', payload: stepId });
  }, []);

  const isStepCompleted = useCallback((stepId: string) => {
    return state.completedSteps.has(stepId);
  }, [state.completedSteps]);

  const setError = useCallback((key: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: { key, message } });
  }, []);

  const clearError = useCallback((key: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: key });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setTestMode = useCallback((testMode: boolean) => {
    dispatch({ type: 'SET_TEST_MODE', payload: testMode });
  }, []);

  const resetSetup = useCallback(() => {
    dispatch({ type: 'RESET_SETUP' });
  }, []);

  const validateStep = useCallback(async (stepId: string): Promise<boolean> => {
    // Step-specific validation logic
    switch (stepId) {
      case 'organization':
        return !!(state.setupData.organization?.name && state.setupData.organization?.domain);
      
      case 'admin':
        return !!(
          state.setupData.admin?.email && 
          state.setupData.admin?.password && 
          state.setupData.admin?.firstName && 
          state.setupData.admin?.lastName
        );
      
      case 'database':
        if (state.setupData.database?.type === 'sqlite') {
          return !!(state.setupData.database?.path);
        }
        return !!(
          state.setupData.database?.host && 
          state.setupData.database?.database && 
          state.setupData.database?.username
        );
      
      case 'authentication':
        // Optional step - always valid
        return true;
      
      case 'email':
        if (state.setupData.email?.provider === 'console') return true;
        
        // For other providers, require from email and name
        if (!state.setupData.email?.fromEmail || !state.setupData.email?.fromName) {
          return false;
        }
        
        // Provider-specific validation
        if (state.setupData.email?.provider === 'smtp') {
          return !!(state.setupData.email?.host && state.setupData.email?.port);
        }
        
        if (state.setupData.email?.provider === 'sendgrid' || state.setupData.email?.provider === 'ses') {
          return !!(state.setupData.email?.apiKey);
        }
        
        return true;
      
      case 'services':
        // Validate S3 configuration if selected
        if (state.setupData.services?.storageProvider === 's3') {
          return !!(
            state.setupData.services?.s3Bucket &&
            state.setupData.services?.s3AccessKey &&
            state.setupData.services?.s3SecretKey
          );
        }
        
        // Validate Slack if enabled
        if (state.setupData.services?.slackEnabled) {
          return !!(state.setupData.services?.slackToken);
        }
        
        // Validate Teams if enabled
        if (state.setupData.services?.teamsEnabled) {
          return !!(state.setupData.services?.teamsWebhook);
        }
        
        // Validate Elasticsearch if enabled
        if (state.setupData.services?.elasticsearchEnabled) {
          return !!(state.setupData.services?.elasticsearchUrl);
        }
        
        // Validate AI assist if enabled
        if (state.setupData.services?.aiAssistEnabled) {
          return !!(state.setupData.services?.openaiApiKey);
        }
        
        // Validate Sentinel if enabled
        if (state.setupData.services?.sentinelEnabled) {
          return !!(state.setupData.services?.sentinelUrl);
        }
        
        // Validate GoAlert if enabled
        if (state.setupData.services?.goalertEnabled) {
          return !!(state.setupData.services?.goalertUrl && state.setupData.services?.goalertApiKey);
        }
        
        return true;
      
      case 'branding':
        // Company name is required
        return !!(state.setupData.branding?.companyName?.trim());
      
      default:
        return true;
    }
  }, [state.setupData]);

  const saveProgress = useCallback(async () => {
    try {
      const progressData = {
        currentStep: state.currentStep,
        setupData: state.setupData,
        completedSteps: Array.from(state.completedSteps),
        timestamp: Date.now(),
      };
      localStorage.setItem('nova-setup-progress', JSON.stringify(progressData));
    } catch (error) {
      console.warn('Failed to save setup progress:', error);
    }
  }, [state.currentStep, state.setupData, state.completedSteps]);

  const loadProgress = useCallback(async () => {
    try {
      const savedProgress = localStorage.getItem('nova-setup-progress');
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        // Check if progress is recent (within 24 hours)
        const isRecent = Date.now() - progressData.timestamp < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          dispatch({ type: 'SET_CURRENT_STEP', payload: progressData.currentStep });
          dispatch({ type: 'UPDATE_SETUP_DATA', payload: progressData.setupData });
          
          progressData.completedSteps.forEach((stepId: string) => {
            dispatch({ type: 'COMPLETE_STEP', payload: stepId });
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load setup progress:', error);
    }
  }, []);

  // Load progress on mount
  React.useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const contextValue: SetupContextType = {
    currentStep: state.currentStep,
    setCurrentStep,
    setupData: state.setupData,
    updateSetupData,
    completedSteps: state.completedSteps,
    completeStep,
    isStepCompleted,
    errors: state.errors,
    setError,
    clearError,
    isLoading: state.isLoading,
    setLoading,
    isTestMode: state.isTestMode,
    setTestMode,
    resetSetup,
    validateStep,
    saveProgress,
    loadProgress,
  };

  return (
    <SetupContext.Provider value={contextValue}>
      {children}
    </SetupContext.Provider>
  );
};
