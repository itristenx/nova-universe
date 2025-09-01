/**
 * ITSM Training Data Management
 * Provides structured training data for IT Service Management models with Cosmo personality integration
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../logger.js';

// ITSM Domain Interfaces
export interface ITSMTrainingData {
  id: string;
  type: 'ticket' | 'incident' | 'request' | 'problem' | 'change' | 'release';
  category: ITSMCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  impact: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  resolution?: string;
  cosmoPersonality: CosmoPersonalityTraits;
  metadata: ITSMMetadata;
  features: number[];
  labels: number[];
}

export interface ITSMCategory {
  primary: string;
  secondary?: string;
  subcategory?: string;
  businessService?: string;
  configurationItem?: string;
}

export interface CosmoPersonalityTraits {
  tone: 'friendly' | 'professional' | 'empathetic' | 'solution-focused';
  responseStyle: 'detailed' | 'concise' | 'step-by-step' | 'conversational';
  expertise: string[];
  communicationPreferences: {
    usesEmojis: boolean;
    providesContext: boolean;
    offersAlternatives: boolean;
    followsUpProactively: boolean;
  };
}

export interface ITSMMetadata {
  source: string;
  timestamp: Date;
  assignedTeam?: string;
  slaCategory?: string;
  businessImpact?: string;
  technicalComplexity?: 'low' | 'medium' | 'high';
  customerSatisfaction?: number;
  resolutionTime?: number;
}

// ITSM Training Data Service
export class ITSMTrainingDataService extends EventEmitter {
  private readonly dataPath: string;
  private trainingDatasets: Map<string, ITSMTrainingData[]>;
  private cosmoPersonalityProfiles: Map<string, CosmoPersonalityTraits>;
  
  constructor() {
    super();
    this.dataPath = process.env.ITSM_DATA_PATH || './data/itsm';
    this.trainingDatasets = new Map();
    this.cosmoPersonalityProfiles = new Map();
    this.initializeCosmoPersonalities();
  }

  /**
   * Initialize Cosmo personality profiles for different ITSM scenarios
   */
  private initializeCosmoPersonalities(): void {
    // Default Cosmo personality for general ITSM interactions
    this.cosmoPersonalityProfiles.set('default', {
      tone: 'friendly',
      responseStyle: 'conversational',
      expertise: ['ITSM', 'troubleshooting', 'customer service', 'technical support'],
      communicationPreferences: {
        usesEmojis: false,
        providesContext: true,
        offersAlternatives: true,
        followsUpProactively: true
      }
    });

    // Technical expert Cosmo for complex issues
    this.cosmoPersonalityProfiles.set('technical-expert', {
      tone: 'professional',
      responseStyle: 'detailed',
      expertise: ['system administration', 'network troubleshooting', 'infrastructure', 'security'],
      communicationPreferences: {
        usesEmojis: false,
        providesContext: true,
        offersAlternatives: true,
        followsUpProactively: false
      }
    });

    // Empathetic Cosmo for high-impact incidents
    this.cosmoPersonalityProfiles.set('crisis-management', {
      tone: 'empathetic',
      responseStyle: 'step-by-step',
      expertise: ['incident management', 'crisis communication', 'escalation procedures'],
      communicationPreferences: {
        usesEmojis: false,
        providesContext: true,
        offersAlternatives: false,
        followsUpProactively: true
      }
    });
  }

  /**
   * Generate comprehensive ITSM training data
   */
  async generateITSMTrainingData(): Promise<ITSMTrainingData[]> {
    logger.info('Generating ITSM training data with Cosmo personality traits...');

    const trainingData: ITSMTrainingData[] = [];

    // Hardware-related tickets
    const hardwareTickets = this.generateHardwareTickets();
    trainingData.push(...hardwareTickets);

    // Software-related tickets
    const softwareTickets = this.generateSoftwareTickets();
    trainingData.push(...softwareTickets);

    // Network connectivity tickets
    const networkTickets = this.generateNetworkTickets();
    trainingData.push(...networkTickets);

    // Access management tickets
    const accessTickets = this.generateAccessTickets();
    trainingData.push(...accessTickets);

    // Incident management scenarios
    const incidentTickets = this.generateIncidentTickets();
    trainingData.push(...incidentTickets);

    // Change management requests
    const changeRequests = this.generateChangeRequests();
    trainingData.push(...changeRequests);

    logger.info(`Generated ${trainingData.length} ITSM training samples with Cosmo personality traits`);
    return trainingData;
  }

  /**
   * Generate hardware-related training data
   */
  private generateHardwareTickets(): ITSMTrainingData[] {
    const templates = [
      {
        title: "Laptop running very slow and freezing frequently",
        description: "My laptop has been running extremely slow for the past week. It freezes when I try to open multiple applications and takes forever to start up. This is affecting my productivity significantly.",
        category: { primary: 'Hardware', secondary: 'Computer', subcategory: 'Performance' },
        priority: 'medium' as const,
        urgency: 'medium' as const,
        impact: 'medium' as const,
        resolution: "Diagnosed memory issue. Upgraded RAM from 8GB to 16GB and performed disk cleanup. System performance restored to normal levels.",
        personalityType: 'technical-expert'
      },
      {
        title: "Monitor displaying flickering colors and going black intermittently",
        description: "My external monitor keeps flickering between normal display and showing strange colors. Sometimes it goes completely black for a few seconds before coming back on.",
        category: { primary: 'Hardware', secondary: 'Display', subcategory: 'Monitor' },
        priority: 'high' as const,
        urgency: 'high' as const,
        impact: 'medium' as const,
        resolution: "Replaced faulty display cable and updated graphics drivers. Monitor now functioning normally without flickering issues.",
        personalityType: 'default'
      },
      {
        title: "Printer not responding to print commands from any computer",
        description: "The office printer has stopped working completely. None of the computers can connect to it, and the printer display shows an error message that I can't understand.",
        category: { primary: 'Hardware', secondary: 'Printer', subcategory: 'Connectivity' },
        priority: 'high' as const,
        urgency: 'high' as const,
        impact: 'high' as const,
        resolution: "Reset printer network settings and reconfigured IP address. Updated printer drivers on all connected computers. Printer fully operational.",
        personalityType: 'crisis-management'
      }
    ];

    return templates.map((template, index) => this.createTrainingDataFromTemplate(template, `hw_${index}`, 'ticket'));
  }

  /**
   * Generate software-related training data
   */
  private generateSoftwareTickets(): ITSMTrainingData[] {
    const templates = [
      {
        title: "Microsoft Office crashes when opening large Excel files",
        description: "Excel crashes immediately when I try to open files larger than 10MB. This happens consistently and I need these files for my monthly reports that are due tomorrow.",
        category: { primary: 'Software', secondary: 'Office Applications', subcategory: 'Excel' },
        priority: 'high' as const,
        urgency: 'high' as const,
        impact: 'medium' as const,
        resolution: "Increased Excel memory allocation settings and disabled hardware acceleration. Updated to latest Office version. Files now open successfully.",
        personalityType: 'default'
      },
      {
        title: "Unable to install required software due to admin permissions",
        description: "I need to install a new development tool for my project, but I'm getting permission denied errors. My manager has approved this software installation.",
        category: { primary: 'Software', secondary: 'Installation', subcategory: 'Permissions' },
        priority: 'medium' as const,
        urgency: 'medium' as const,
        impact: 'low' as const,
        resolution: "Verified software approval and temporarily elevated user permissions. Installed software successfully and restored standard user access.",
        personalityType: 'technical-expert'
      }
    ];

    return templates.map((template, index) => this.createTrainingDataFromTemplate(template, `sw_${index}`, 'ticket'));
  }

  /**
   * Generate network-related training data
   */
  private generateNetworkTickets(): ITSMTrainingData[] {
    const templates = [
      {
        title: "Internet connection drops every few hours requiring restart",
        description: "My internet connection keeps dropping throughout the day. I have to restart my computer to get it working again. This is happening to multiple people in our department.",
        category: { primary: 'Network', secondary: 'Connectivity', subcategory: 'WiFi' },
        priority: 'high' as const,
        urgency: 'high' as const,
        impact: 'high' as const,
        resolution: "Identified failing network switch in department. Replaced hardware and reconfigured network settings. Connection now stable for all users.",
        personalityType: 'crisis-management'
      },
      {
        title: "VPN connection fails with authentication error",
        description: "I can't connect to the company VPN from home. It worked fine last week, but now I'm getting authentication failed messages even though my password is correct.",
        category: { primary: 'Network', secondary: 'VPN', subcategory: 'Authentication' },
        priority: 'medium' as const,
        urgency: 'medium' as const,
        impact: 'medium' as const,
        resolution: "Reset VPN user certificate and updated VPN client software. Provided user with new connection profile. VPN access restored.",
        personalityType: 'technical-expert'
      }
    ];

    return templates.map((template, index) => this.createTrainingDataFromTemplate(template, `net_${index}`, 'ticket'));
  }

  /**
   * Generate access management training data
   */
  private generateAccessTickets(): ITSMTrainingData[] {
    const templates = [
      {
        title: "Need access to shared project folder for new team member",
        description: "We have a new team member starting today who needs access to our shared project files. They should have the same permissions as other team members.",
        category: { primary: 'Access Management', secondary: 'File Sharing', subcategory: 'Permissions' },
        priority: 'medium' as const,
        urgency: 'medium' as const,
        impact: 'low' as const,
        resolution: "Added new user to appropriate security groups and granted access to shared project folder. Verified permissions are working correctly.",
        personalityType: 'default'
      }
    ];

    return templates.map((template, index) => this.createTrainingDataFromTemplate(template, `acc_${index}`, 'request'));
  }

  /**
   * Generate incident management training data
   */
  private generateIncidentTickets(): ITSMTrainingData[] {
    const templates = [
      {
        title: "Email server down - entire company cannot send or receive emails",
        description: "Our email server appears to be completely down. No one in the company can send or receive emails. This is causing major business disruption as we have client meetings today.",
        category: { primary: 'Infrastructure', secondary: 'Email', subcategory: 'Server' },
        priority: 'critical' as const,
        urgency: 'critical' as const,
        impact: 'critical' as const,
        resolution: "Identified failed email server hardware. Activated backup email server and restored service. Replaced failed hardware to prevent future occurrences.",
        personalityType: 'crisis-management'
      }
    ];

    return templates.map((template, index) => this.createTrainingDataFromTemplate(template, `inc_${index}`, 'incident'));
  }

  /**
   * Generate change management training data
   */
  private generateChangeRequests(): ITSMTrainingData[] {
    const templates = [
      {
        title: "Request to upgrade database server to support new application",
        description: "We need to upgrade our database server specifications to support a new business application that will be deployed next month. The current server doesn't meet the minimum requirements.",
        category: { primary: 'Infrastructure', secondary: 'Database', subcategory: 'Upgrade' },
        priority: 'medium' as const,
        urgency: 'low' as const,
        impact: 'medium' as const,
        resolution: "Change approved by CAB. Scheduled maintenance window and upgraded database server hardware. New application successfully deployed and tested.",
        personalityType: 'technical-expert'
      }
    ];

    return templates.map((template, index) => this.createTrainingDataFromTemplate(template, `chg_${index}`, 'change'));
  }

  /**
   * Create training data from template with feature extraction
   */
  private createTrainingDataFromTemplate(
    template: any,
    id: string,
    type: ITSMTrainingData['type']
  ): ITSMTrainingData {
    const cosmoPersonality = this.cosmoPersonalityProfiles.get(template.personalityType) || 
                            this.cosmoPersonalityProfiles.get('default')!;

    // Extract features from text (simplified feature extraction)
    const features = this.extractFeatures(template.title + ' ' + template.description);
    const labels = this.generateLabels(template.category, template.priority, template.urgency, template.impact);

    return {
      id,
      type,
      category: template.category,
      priority: template.priority,
      urgency: template.urgency,
      impact: template.impact,
      title: template.title,
      description: template.description,
      resolution: template.resolution,
      cosmoPersonality,
      metadata: {
        source: 'itsm-training-generator',
        timestamp: new Date(),
        technicalComplexity: this.assessTechnicalComplexity(template),
        customerSatisfaction: Math.random() * 5, // Simulated satisfaction score
        resolutionTime: Math.floor(Math.random() * 1440) + 30 // 30 minutes to 24 hours
      },
      features,
      labels
    };
  }

  /**
   * Extract numerical features from text for ML training
   */
  private extractFeatures(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const features: number[] = [];

    // Word count features
    features.push(words.length);

    // Urgency indicators
    const urgencyWords = ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'down', 'crash', 'fail'];
    features.push(urgencyWords.filter(word => text.toLowerCase().includes(word)).length);

    // Technical complexity indicators
    const techWords = ['server', 'database', 'network', 'system', 'application', 'hardware', 'software'];
    features.push(techWords.filter(word => text.toLowerCase().includes(word)).length);

    // Business impact indicators
    const businessWords = ['business', 'production', 'client', 'customer', 'revenue', 'meeting'];
    features.push(businessWords.filter(word => text.toLowerCase().includes(word)).length);

    // Sentiment indicators
    const negativeWords = ['problem', 'issue', 'error', 'broken', 'not working', 'fail', 'slow'];
    features.push(negativeWords.filter(word => text.toLowerCase().includes(word)).length);

    return features;
  }

  /**
   * Generate classification labels for training
   */
  private generateLabels(
    category: ITSMCategory,
    priority: string,
    urgency: string,
    impact: string
  ): number[] {
    const labels: number[] = [];

    // Category labels (one-hot encoding)
    const categories = ['Hardware', 'Software', 'Network', 'Access Management', 'Infrastructure'];
    labels.push(...categories.map(cat => cat === category.primary ? 1 : 0));

    // Priority labels
    const priorities = ['low', 'medium', 'high', 'critical'];
    labels.push(...priorities.map(p => p === priority ? 1 : 0));

    // Urgency labels
    labels.push(...priorities.map(u => u === urgency ? 1 : 0));

    // Impact labels
    labels.push(...priorities.map(i => i === impact ? 1 : 0));

    return labels;
  }

  /**
   * Assess technical complexity of an issue
   */
  private assessTechnicalComplexity(template: any): 'low' | 'medium' | 'high' {
    const text = (template.title + ' ' + template.description).toLowerCase();
    
    if (text.includes('server') || text.includes('database') || text.includes('network') || text.includes('infrastructure')) {
      return 'high';
    } else if (text.includes('application') || text.includes('software') || text.includes('system')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Save training data to file system
   */
  async saveTrainingData(data: ITSMTrainingData[], filename: string): Promise<void> {
    try {
      await fs.mkdir(this.dataPath, { recursive: true });
      const filePath = path.join(this.dataPath, `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      logger.info(`ITSM training data saved to ${filePath}`);
    } catch (error) {
      logger.error('Failed to save ITSM training data:', error);
      throw error;
    }
  }

  /**
   * Load training data from file system
   */
  async loadTrainingData(filename: string): Promise<ITSMTrainingData[]> {
    try {
      const filePath = path.join(this.dataPath, `${filename}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to load ITSM training data:', error);
      throw error;
    }
  }

  /**
   * Get Cosmo personality profile
   */
  getCosmoPersonality(profileName: string): CosmoPersonalityTraits | undefined {
    return this.cosmoPersonalityProfiles.get(profileName);
  }

  /**
   * Update Cosmo personality profile
   */
  updateCosmoPersonality(profileName: string, traits: CosmoPersonalityTraits): void {
    this.cosmoPersonalityProfiles.set(profileName, traits);
    this.emit('cosmoPersonalityUpdated', { profileName, traits });
  }

  /**
   * Get all available personality profiles
   */
  getAllPersonalityProfiles(): Map<string, CosmoPersonalityTraits> {
    return new Map(this.cosmoPersonalityProfiles);
  }
}

// Export singleton instance
export const itsmTrainingData = new ITSMTrainingDataService();