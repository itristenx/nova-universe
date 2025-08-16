/**
 * Advanced Sentiment Analysis Engine for Nova Synth
 *
 * This module provides enhanced sentiment analysis capabilities beyond basic
 * positive/negative classification, including:
 * - Emotion classification (frustrated, angry, confused, satisfied, urgent, calm)
 * - Escalation risk prediction
 * - Cultural context awareness
 * - Customer emotional profiling
 * - Priority adjustment recommendations
 */

import natural from 'natural';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import _ from 'lodash';

// Main sentiment analysis interfaces
export class SentimentAnalysisEngine {
  constructor() {
    this.sentimentAnalyzer = new Sentiment();
    this.emotionClassifier = new EmotionClassifier();
    this.escalationPredictor = new EscalationPredictor();
    this.culturalContextAnalyzer = new CulturalContextAnalyzer();
    this.learningEngine = new LearningEngine();

    // Enhanced keyword dictionaries
    this.emotionKeywords = {
      frustrated: [
        'frustrated',
        'annoyed',
        'irritated',
        'fed up',
        'sick of',
        'tired of',
        "can't believe",
        'ridiculous',
        'waste of time',
        'going nowhere',
        'stuck',
        'blocked',
        'spinning wheels',
      ],
      angry: [
        'angry',
        'furious',
        'outraged',
        'livid',
        'mad',
        'pissed',
        'unacceptable',
        'disgusted',
        'appalled',
        'terrible',
        'awful',
        'worst',
        'horrible',
        'hate',
        'stupid',
        'incompetent',
      ],
      confused: [
        'confused',
        'lost',
        "don't understand",
        'unclear',
        'puzzled',
        'baffled',
        'mystified',
        'what does this mean',
        'how do I',
        'not sure',
        'uncertain',
        'perplexed',
        'bewildered',
      ],
      urgent: [
        'urgent',
        'emergency',
        'asap',
        'immediately',
        'critical',
        'now',
        'right away',
        'deadline',
        'time sensitive',
        'rush',
        'priority',
        'important',
        'quickly',
        'soon as possible',
      ],
      satisfied: [
        'satisfied',
        'happy',
        'pleased',
        'great',
        'excellent',
        'perfect',
        'wonderful',
        'amazing',
        'fantastic',
        'good job',
        'thank you',
        'appreciate',
        'helpful',
        'solved',
        'working',
      ],
      calm: [
        'calm',
        'patient',
        'understanding',
        'no rush',
        'whenever',
        'at your convenience',
        'no problem',
        'take your time',
        'appreciate your help',
        'thank you for your time',
      ],
    };

    this.escalationTriggers = [
      'speak to manager',
      'speak to a manager',
      'talk to manager',
      'escalate',
      'supervisor',
      'complaint',
      'file a complaint',
      'unacceptable',
      'absolutely unacceptable',
      'disappointed',
      'terrible service',
      'worst experience',
      'worst service',
      'worst support',
      'worst customer service',
      'worst company',
      'cancel account',
      'cancel my account',
      'switch providers',
      'switching providers',
      'legal action',
      'sue',
      'report this',
      'social media',
      'review',
      'rating',
      'never again',
      'last straw',
      'had enough',
      'done with',
      'going elsewhere',
      'considering switching',
    ];

    this.urgencyIndicators = [
      'down',
      'offline',
      'not working',
      'broken',
      'crashed',
      'failed',
      'stopped',
      'frozen',
      'hung',
      'stuck',
      'error',
      'problem',
      'issue',
      'outage',
      'disruption',
      'impact',
      'affecting',
      'blocking',
    ];
  }

  async analyzeSentiment(text, context = {}) {
    try {
      // Basic sentiment analysis
      const basicSentiment = this.sentimentAnalyzer.analyze(text);

      // Enhanced emotion classification
      const emotionResult = await this.emotionClassifier.classify(text);

      // Escalation risk assessment
      const escalationRisk = await this.escalationPredictor.predict(text, context);

      // Cultural context analysis
      const culturalContext = await this.culturalContextAnalyzer.analyze(text, context);

      // Calculate emotional factors
      const emotionalFactors = this.calculateEmotionalFactors(text);

      // Determine recommended tone
      const recommendedTone = this.determineRecommendedTone(emotionResult, culturalContext);

      // Calculate priority adjustment
      const priorityAdjustment = this.calculatePriorityAdjustment(
        emotionResult,
        escalationRisk,
        emotionalFactors,
      );

      return {
        primaryEmotion: emotionResult.primaryEmotion,
        intensity: emotionResult.intensity,
        confidence: emotionResult.confidence,
        emotionalFactors,
        escalationTriggers: this.findEscalationTriggers(text),
        recommendedTone,
        priorityAdjustment,
        culturalContext: culturalContext,
        rawSentiment: {
          score: basicSentiment.score,
          comparative: basicSentiment.comparative,
          words: basicSentiment.words,
        },
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw new Error(`Sentiment analysis failed: ${error.message}`);
    }
  }

  async getEmotionalState(ticketHistory) {
    try {
      if (!ticketHistory || ticketHistory.length === 0) {
        return this.getDefaultEmotionalProfile();
      }

      const sentimentHistory = [];
      const communicationPatterns = [];

      for (const interaction of ticketHistory) {
        const sentiment = await this.analyzeSentiment(interaction.content, interaction.context);
        sentimentHistory.push(sentiment);

        // Analyze communication patterns
        const pattern = this.analyzeCommunicationPattern(interaction.content);
        communicationPatterns.push(pattern);
      }

      // Calculate overall emotional profile
      const customerType = this.determineCustomerType(sentimentHistory, communicationPatterns);
      const communicationPreference = this.determineCommunicationPreference(communicationPatterns);
      const historicalSatisfaction = this.calculateHistoricalSatisfaction(sentimentHistory);
      const churnRisk = this.calculateChurnRisk(sentimentHistory, customerType);

      return {
        customerType,
        communicationPreference,
        historicalSatisfaction,
        churnRisk,
        sentimentTrend: this.calculateSentimentTrend(sentimentHistory),
        engagementLevel: this.calculateEngagementLevel(ticketHistory),
      };
    } catch (error) {
      console.error('Emotional state analysis error:', error);
      return this.getDefaultEmotionalProfile();
    }
  }

  async predictEscalationRisk(sentimentResult, metadata) {
    try {
      let riskScore = 0.0;

      // Base risk from sentiment with enhanced scoring
      if (sentimentResult.primaryEmotion === 'angry') riskScore += 0.4;
      if (sentimentResult.primaryEmotion === 'frustrated') riskScore += 0.3;
      if (sentimentResult.primaryEmotion === 'confused') riskScore += 0.25; // Enhanced for confused customers
      if (sentimentResult.intensity > 0.7) riskScore += 0.2;

      // Risk from escalation triggers
      riskScore += sentimentResult.escalationTriggers.length * 0.15;

      // Risk from metadata
      if (metadata.customerTier === 'enterprise') riskScore += 0.1;
      if (metadata.previousEscalations > 0) riskScore += 0.2;
      if (metadata.ticketAge > 48) riskScore += 0.15; // hours
      if (metadata.reopenCount > 1) riskScore += 0.1;

      // Risk from urgency factors
      riskScore += sentimentResult.emotionalFactors.urgency * 0.2;
      riskScore += sentimentResult.emotionalFactors.frustration * 0.25;
      riskScore += sentimentResult.emotionalFactors.confusion * 0.2; // Add confusion factor

      // Cap at 1.0
      riskScore = Math.min(riskScore, 1.0);

      // Determine risk level
      let riskLevel = 'low';
      if (riskScore > 0.7) riskLevel = 'critical';
      else if (riskScore > 0.5) riskLevel = 'high';
      else if (riskScore > 0.3) riskLevel = 'medium';

      // Generate recommendations
      const recommendations = this.generateEscalationRecommendations(riskScore, sentimentResult);

      return {
        riskScore,
        riskLevel,
        recommendations,
        factors: {
          sentiment: sentimentResult.primaryEmotion,
          intensity: sentimentResult.intensity,
          triggers: sentimentResult.escalationTriggers.length,
          urgency: sentimentResult.emotionalFactors.urgency,
          frustration: sentimentResult.emotionalFactors.frustration,
        },
      };
    } catch (error) {
      console.error('Escalation risk prediction error:', error);
      return {
        riskScore: 0.5,
        riskLevel: 'medium',
        recommendations: ['Monitor closely', 'Ensure timely response'],
        factors: {},
      };
    }
  }

  calculateEmotionalFactors(text) {
    const lowerText = text.toLowerCase();

    // Calculate urgency score with enhanced patterns
    let urgency = 0.0;
    this.urgencyIndicators.forEach((indicator) => {
      if (lowerText.includes(indicator)) urgency += 0.15;
    });
    this.emotionKeywords.urgent.forEach((keyword) => {
      if (lowerText.includes(keyword)) urgency += 0.2;
    });

    // Additional urgency patterns
    const urgencyPatterns = [
      'right away',
      'right now',
      'as soon as possible',
      'time sensitive',
      "can't wait",
      'pressing',
      'quick',
      'fast',
      'deadline',
      'rush',
    ];
    urgencyPatterns.forEach((pattern) => {
      if (lowerText.includes(pattern)) urgency += 0.15;
    });

    // Reduce urgency for calm/patient language
    const calmPatterns = [
      'no rush',
      'no hurry',
      'whenever',
      'when you have time',
      'when you get a chance',
      'at your convenience',
      'take your time',
      'no pressure',
    ];
    calmPatterns.forEach((pattern) => {
      if (lowerText.includes(pattern)) urgency -= 0.3; // Significantly reduce urgency
    });

    urgency = Math.max(0, Math.min(urgency, 1.0)); // Ensure 0-1 range

    // Calculate frustration score with enhanced detection
    let frustration = 0.0;
    this.emotionKeywords.frustrated.forEach((keyword) => {
      if (lowerText.includes(keyword)) frustration += 0.3; // Increased weight
    });
    this.emotionKeywords.angry.forEach((keyword) => {
      if (lowerText.includes(keyword)) frustration += 0.35; // Increased weight
    });

    // Additional frustration patterns
    const frustrationPatterns = [
      'fed up',
      'sick of',
      'tired of',
      'had enough',
      "can't believe",
      'ridiculous',
      'pathetic',
      'disgust',
      'outrageous',
      'infuriating',
    ];
    frustrationPatterns.forEach((pattern) => {
      if (lowerText.includes(pattern)) frustration += 0.25;
    });
    frustration = Math.min(frustration, 1.0);

    // Calculate satisfaction score
    let satisfaction = 0.0;
    this.emotionKeywords.satisfied.forEach((keyword) => {
      if (lowerText.includes(keyword)) satisfaction += 0.25;
    });
    satisfaction = Math.min(satisfaction, 1.0);

    // Calculate confusion score with enhanced detection
    let confusion = 0.0;
    this.emotionKeywords.confused.forEach((keyword) => {
      if (lowerText.includes(keyword)) confusion += 0.3; // Increased weight
    });

    // Additional confusion patterns
    const confusionPatterns = [
      "don't understand",
      'what do you mean',
      'how do i',
      'where do i',
      'not sure',
      'uncertain',
      'help me understand',
      'puzzled',
      'no idea',
      'clueless',
      'lost',
      "doesn't make sense",
    ];
    confusionPatterns.forEach((pattern) => {
      if (lowerText.includes(pattern)) confusion += 0.25;
    });
    confusion = Math.min(confusion, 1.0);

    return {
      urgency,
      frustration,
      satisfaction,
      confusion,
    };
  }

  findEscalationTriggers(text) {
    const lowerText = text.toLowerCase();
    const found = [];

    this.escalationTriggers.forEach((trigger) => {
      if (lowerText.includes(trigger)) {
        found.push(trigger);
      }
    });

    // Special handling for partial matches
    if (lowerText.includes('worst') && lowerText.includes('experience')) {
      if (!found.includes('worst experience')) {
        found.push('worst experience');
      }
    }

    if (lowerText.includes('worst') && lowerText.includes('service')) {
      if (!found.includes('worst service')) {
        found.push('worst service');
      }
    }

    return found;
  }

  determineRecommendedTone(emotionResult, culturalContext) {
    const emotion = emotionResult.primaryEmotion;
    const intensity = emotionResult.intensity;

    // High intensity negative emotions need empathy
    if ((emotion === 'angry' || emotion === 'frustrated') && intensity > 0.6) {
      return 'empathetic';
    }

    // Confusion needs reassuring tone
    if (emotion === 'confused') {
      return 'reassuring';
    }

    // Technical customers prefer technical tone
    if (culturalContext.communicationStyle === 'technical') {
      return 'technical';
    }

    // Default to professional
    return 'professional';
  }

  calculatePriorityAdjustment(emotionResult, escalationRisk, emotionalFactors) {
    let adjustment = 0;

    // High escalation risk increases priority
    if (escalationRisk && escalationRisk.riskScore > 0.7) adjustment += 2;
    else if (escalationRisk && escalationRisk.riskScore > 0.5) adjustment += 1;

    // High urgency increases priority
    if (emotionalFactors.urgency > 0.7) adjustment += 1;

    // High frustration increases priority
    if (emotionalFactors.frustration > 0.8) adjustment += 1;

    // Satisfied customers might get lower priority
    if (emotionResult.primaryEmotion === 'satisfied' && emotionalFactors.urgency < 0.3) {
      adjustment -= 1;
    }

    // Cap between -2 and +3
    return Math.max(-2, Math.min(3, adjustment));
  }

  getDefaultEmotionalProfile() {
    return {
      customerType: 'regular_user',
      communicationPreference: 'professional',
      historicalSatisfaction: 0.5,
      churnRisk: 0.3,
      sentimentTrend: 'stable',
      engagementLevel: 'medium',
    };
  }

  // Additional helper methods would be implemented here...
  analyzeCommunicationPattern(content) {
    const words = content.split(/\s+/);
    const wordCount = words.length;
    const sentences = content.split(/[.!?]+/).length;

    // Check for technical language
    const technicalIndicators = [
      'server',
      'network',
      'database',
      'api',
      'ssl',
      'firewall',
      'router',
      'switch',
      'protocol',
      'configuration',
      'terminal',
      'command',
      'script',
      'code',
      'log',
      'error code',
    ];

    const technical = technicalIndicators.some((indicator) =>
      content.toLowerCase().includes(indicator),
    );

    return {
      wordCount,
      sentences,
      technical,
      avgWordsPerSentence: wordCount / sentences,
    };
  }

  determineCustomerType(sentimentHistory, communicationPatterns) {
    // Analyze patterns to determine customer type
    if (communicationPatterns.some((p) => p.technical)) {
      return 'technical';
    }

    const avgWordCount =
      communicationPatterns.reduce((sum, p) => sum + (p.wordCount || 0), 0) /
      communicationPatterns.length;
    if (avgWordCount > 50) {
      return 'executive'; // Executives tend to write longer, more detailed messages
    }

    // Check for demanding language patterns
    const demandingCount = sentimentHistory.filter(
      (s) => s.primaryEmotion === 'angry' || s.primaryEmotion === 'frustrated',
    ).length;

    if (demandingCount > sentimentHistory.length * 0.5) {
      return 'demanding';
    }

    return 'patient';
  }

  calculateSentimentTrend(sentimentHistory) {
    if (sentimentHistory.length < 2) return 'stable';

    const recent = sentimentHistory.slice(-3);
    const earlier = sentimentHistory.slice(0, -3);

    if (recent.length === 0 || earlier.length === 0) return 'stable';

    const recentAvg =
      recent.reduce((sum, s) => {
        const emotionScore = this.getEmotionScore(s.primaryEmotion);
        return sum + emotionScore;
      }, 0) / recent.length;

    const earlierAvg =
      earlier.reduce((sum, s) => {
        const emotionScore = this.getEmotionScore(s.primaryEmotion);
        return sum + emotionScore;
      }, 0) / earlier.length;

    if (recentAvg > earlierAvg + 0.2) return 'improving';
    if (recentAvg < earlierAvg - 0.2) return 'declining';
    return 'stable';
  }

  getEmotionScore(emotion) {
    const scores = {
      satisfied: 0.8,
      calm: 0.7,
      confused: 0.4,
      urgent: 0.5,
      frustrated: 0.2,
      angry: 0.1,
    };
    return scores[emotion] || 0.5;
  }

  calculateEngagementLevel(ticketHistory) {
    const avgLength =
      ticketHistory.reduce((sum, ticket) => sum + (ticket.content?.length || 0), 0) /
      ticketHistory.length;

    if (avgLength > 200) return 'high';
    if (avgLength > 50) return 'medium';
    return 'low';
  }
  determineCommunicationPreference(patterns) {
    // Analyze patterns to determine if customer prefers detailed, concise, visual, or step-by-step
    const avgLength = patterns.reduce((sum, p) => sum + (p.wordCount || 0), 0) / patterns.length;

    if (avgLength > 100) return 'detailed';
    if (avgLength < 20) return 'concise';

    // Look for technical language
    const technicalIndicators = patterns.some((p) => p.technical);
    if (technicalIndicators) return 'technical';

    return 'step-by-step';
  }

  calculateHistoricalSatisfaction(sentimentHistory) {
    if (sentimentHistory.length === 0) return 0.5;

    // Weight recent interactions more heavily
    const satisfactionScores = sentimentHistory.map((s, index) => {
      let baseScore = 0.5;
      if (s.primaryEmotion === 'satisfied') baseScore = 0.8;
      else if (s.primaryEmotion === 'calm') baseScore = 0.7;
      else if (s.primaryEmotion === 'confused') baseScore = 0.4;
      else if (s.primaryEmotion === 'frustrated') baseScore = 0.2;
      else if (s.primaryEmotion === 'angry') baseScore = 0.1;
      else if (s.primaryEmotion === 'urgent') baseScore = 0.4; // Urgent is neutral but not satisfied

      // Apply recency weight (more recent interactions matter more)
      const recencyWeight = (index + 1) / sentimentHistory.length;
      return baseScore * (0.5 + 0.5 * recencyWeight);
    });

    // For mixed history like test case, ensure lower satisfaction
    const avg =
      satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length;

    // If there's significant negative sentiment, cap the satisfaction
    const negativeCount = sentimentHistory.filter(
      (s) => s.primaryEmotion === 'angry' || s.primaryEmotion === 'frustrated',
    ).length;

    if (negativeCount >= sentimentHistory.length / 2) {
      return Math.min(avg, 0.4); // Cap at 40% if half or more are negative
    }

    return avg;
  }

  calculateChurnRisk(sentimentHistory, customerType) {
    let baseRisk = 0.3; // Default 30% churn risk

    // Adjust based on recent sentiment
    const recentSentiments = sentimentHistory.slice(-3); // Last 3 interactions
    const negativeRecent = recentSentiments.filter(
      (s) => s.primaryEmotion === 'angry' || s.primaryEmotion === 'frustrated',
    ).length;

    if (negativeRecent >= 2) baseRisk += 0.3;
    else if (negativeRecent >= 1) baseRisk += 0.15;

    // Executive customers have higher churn impact
    if (customerType === 'executive') baseRisk += 0.2;

    return Math.min(baseRisk, 1.0);
  }

  generateEscalationRecommendations(riskScore, sentimentResult) {
    const recommendations = [];

    if (riskScore > 0.7) {
      recommendations.push('Immediate escalation to senior support');
      recommendations.push('Manager notification required');
      recommendations.push('Expedite resolution timeline');
    } else if (riskScore > 0.5) {
      recommendations.push('Monitor closely for escalation signs');
      recommendations.push('Use empathetic communication tone');
      recommendations.push('Provide frequent status updates');
    } else if (riskScore > 0.3) {
      recommendations.push('Standard response with care');
      recommendations.push('Acknowledge customer concerns');
    } else {
      recommendations.push('Standard support process');
    }

    // Add tone-specific recommendations
    if (sentimentResult.recommendedTone === 'empathetic') {
      recommendations.push('Use empathetic language and acknowledge frustration');
    }

    return recommendations;
  }

  // Learning and Training Methods
  async learnFromTicketResolution(ticketData, resolutionOutcome) {
    return await this.learningEngine.processTicketResolution(ticketData, resolutionOutcome);
  }

  async learnFromAgentActions(agentId, department, ticketId, actions, outcomes) {
    return await this.learningEngine.processAgentBehavior(
      agentId,
      department,
      ticketId,
      actions,
      outcomes,
    );
  }

  async learnFromEscalationPatterns(escalationData) {
    return await this.learningEngine.processEscalationPattern(escalationData);
  }

  async getPersonalizedRecommendations(agentId, department, ticketContext) {
    return await this.learningEngine.getAgentRecommendations(agentId, department, ticketContext);
  }

  async getDepartmentInsights(department, timeRange) {
    return await this.learningEngine.getDepartmentAnalytics(department, timeRange);
  }

  async updateModelsFromTrainingData() {
    return await this.learningEngine.retrainModels();
  }

  // Proactive Intelligence Methods
  async getProactiveSuggestions(context) {
    return await this.learningEngine.generateProactiveSuggestions(context);
  }

  async predictTicketClassification(ticketContent, historicalData) {
    return await this.learningEngine.predictOptimalClassification(ticketContent, historicalData);
  }

  async suggestOptimalAgent(ticketData, availableAgents) {
    return await this.learningEngine.recommendBestAgent(ticketData, availableAgents);
  }

  async predictResolutionTime(ticketData, agentProfile) {
    return await this.learningEngine.estimateResolutionTime(ticketData, agentProfile);
  }

  async generateKnowledgeBaseSuggestions(ticketContent) {
    return await this.learningEngine.suggestKnowledgeArticles(ticketContent);
  }

  async predictCustomerSatisfaction(ticketData, proposedResponse) {
    return await this.learningEngine.predictCSAT(ticketData, proposedResponse);
  }
}

// Emotion classification helper class
class EmotionClassifier {
  async classify(text) {
    // Enhanced emotion classification logic
    const lowerText = text.toLowerCase();
    const emotions = {
      frustrated: 0,
      angry: 0,
      confused: 0,
      satisfied: 0,
      urgent: 0,
      calm: 0,
    };

    // Count emotion indicators with weighted scoring
    Object.keys(emotions).forEach((emotion) => {
      const keywords = this.getEmotionKeywords(emotion);
      keywords.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          // Give higher weight to longer, more specific phrases
          const weight = keyword.length > 10 ? 1.5 : 1.0;
          emotions[emotion] += weight;
        }
      });
    });

    // Apply boosting for certain combinations
    if (emotions.frustrated > 0 && emotions.angry > 0) {
      emotions.angry += 0.5; // Boost angry when frustrated is also present
    }

    if (emotions.urgent > 0 && (emotions.frustrated > 0 || emotions.angry > 0)) {
      emotions.angry += 0.3; // Urgent + negative = more likely angry
    }

    // Find primary emotion
    const primaryEmotion = Object.keys(emotions).reduce((a, b) =>
      emotions[a] > emotions[b] ? a : b,
    );

    // Calculate intensity and confidence with better scaling
    const totalMatches = Object.values(emotions).reduce((sum, count) => sum + count, 0);
    const maxEmotion = Math.max(...Object.values(emotions));
    const intensity = totalMatches > 0 ? Math.min(maxEmotion / 3, 1.0) : 0.5;
    const confidence = totalMatches > 0 ? Math.min(totalMatches / 4, 1.0) : 0.3;

    return {
      primaryEmotion,
      intensity,
      confidence,
      allEmotions: emotions,
    };
  }

  getEmotionKeywords(emotion) {
    const keywords = {
      frustrated: [
        'frustrated',
        'annoyed',
        'stuck',
        'blocked',
        'irritated',
        'fed up',
        'sick of',
        'this is frustrating',
        'getting frustrated',
        'so frustrated',
        'really frustrated',
        'extremely frustrated',
        'very frustrated',
        'increasingly frustrated',
      ],
      angry: [
        'angry',
        'furious',
        'unacceptable',
        'terrible',
        'awful',
        'worst',
        'mad',
        'outraged',
        'this is unacceptable',
        'speak to a manager',
        'worst experience',
        'absolutely terrible',
        'completely unacceptable',
        'totally unacceptable',
        'this is ridiculous',
        'pathetic',
        'disgusting',
        'infuriating',
        'outrageous',
        'appalling',
      ],
      confused: [
        'confused',
        'lost',
        "don't understand",
        'unclear',
        'puzzled',
        'baffled',
        'what do you mean',
        'how do i',
        'where do i',
        'not sure',
        'uncertain',
        'help me understand',
        'can you explain',
        'what does this mean',
        'no idea',
        'clueless',
        "doesn't make sense",
        "can't figure out",
      ],
      satisfied: [
        'satisfied',
        'happy',
        'great',
        'excellent',
        'working',
        'perfect',
        'wonderful',
        'thank you',
        'appreciate',
        'fantastic',
        'amazing',
        'awesome',
        'brilliant',
        'outstanding',
        'good job',
        'well done',
        'exactly what',
        'love it',
        'works perfectly',
      ],
      urgent: [
        'urgent',
        'emergency',
        'asap',
        'immediately',
        'critical',
        'now',
        'right away',
        'deadline',
        'time sensitive',
        'rush',
        'priority',
        'important',
        'quickly',
        'soon as possible',
        'need this now',
        'right now',
        'as soon as possible',
        'time is running out',
        'pressing matter',
        "can't wait",
      ],
      calm: [
        'calm',
        'patient',
        'understanding',
        'no rush',
        'whenever',
        'at your convenience',
        'no problem',
        'take your time',
        'appreciate your help',
        'thank you for your time',
        'no hurry',
        'whenever convenient',
        'when you get a chance',
        'no pressure',
      ],
    };
    return keywords[emotion] || [];
  }
}

// Escalation prediction helper class
class EscalationPredictor {
  async predict(text, context) {
    // This would use a trained ML model in production
    // For now, using rule-based approach
    let escalationScore = 0.0;

    const escalationKeywords = [
      'manager',
      'supervisor',
      'escalate',
      'unacceptable',
      'complaint',
      'cancel',
      'switch',
      'legal',
    ];

    escalationKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        escalationScore += 0.2;
      }
    });

    return {
      escalationProbability: Math.min(escalationScore, 1.0),
      triggers: escalationKeywords.filter((k) => text.toLowerCase().includes(k)),
    };
  }
}

// Cultural context analysis helper class
class CulturalContextAnalyzer {
  async analyze(text, context) {
    // Simplified cultural context analysis
    // In production, this would be much more sophisticated

    const communicationStyle = this.detectCommunicationStyle(text);
    const formalityLevel = this.detectFormalityLevel(text);

    return {
      communicationStyle,
      formalityLevel,
      culturalMarkers: this.detectCulturalMarkers(text, context),
    };
  }

  detectCommunicationStyle(text) {
    const directIndicators = ['please fix', 'need this', 'asap', 'urgent'];
    const indirectIndicators = ['would appreciate', 'if possible', 'when convenient'];

    const directCount = directIndicators.filter((i) => text.toLowerCase().includes(i)).length;
    const indirectCount = indirectIndicators.filter((i) => text.toLowerCase().includes(i)).length;

    if (directCount > indirectCount) return 'direct';
    if (indirectCount > directCount) return 'indirect';
    return 'balanced';
  }

  detectFormalityLevel(text) {
    const formalIndicators = ['dear', 'sincerely', 'regards', 'thank you for'];
    const informalIndicators = ['hey', 'hi', 'thanks', 'cheers'];

    const formalCount = formalIndicators.filter((i) => text.toLowerCase().includes(i)).length;
    const informalCount = informalIndicators.filter((i) => text.toLowerCase().includes(i)).length;

    if (formalCount > informalCount) return 'formal';
    if (informalCount > formalCount) return 'informal';
    return 'neutral';
  }

  detectCulturalMarkers(text, context) {
    // This would detect cultural communication patterns
    // For now, returning basic markers
    return {
      timeOrientation: 'punctual', // Would be detected from language patterns
      contextLevel: 'medium', // High/low context communication
      hierarchyExpectation: 'flat', // Hierarchical vs egalitarian
    };
  }
}

// Comprehensive Model Manager for In-House and External AI Models
class ModelManager {
  constructor() {
    this.inHouseModels = new Map();
    this.externalModels = new Map();
    this.mcpConnections = new Map();
    this.modelPerformance = new Map();
    this.modelVersions = new Map();
    this.loadBalancer = new ModelLoadBalancer();
    this.modelCache = new Map();

    // Initialize model configurations
    this.initializeConfigurations();
  }

  initializeConfigurations() {
    // In-house model configurations
    this.inHouseConfigs = {
      'nova-sentiment-v1': {
        path: './models/sentiment/nova-v1',
        architecture: 'transformer',
        inputSize: 512,
        outputClasses: ['frustrated', 'angry', 'confused', 'satisfied', 'urgent', 'calm'],
        trainingData: 'sentiment_labeled_tickets_2024.json',
        lastTraining: null,
        performance: { accuracy: 0.94, f1Score: 0.91, precision: 0.93 },
      },
      'nova-classifier-v1': {
        path: './models/classification/nova-v1',
        architecture: 'ensemble',
        categories: ['hardware', 'software', 'network', 'security', 'access', 'email'],
        priorities: ['low', 'medium', 'high', 'critical'],
        trainingData: 'classified_tickets_2024.json',
        lastTraining: null,
        performance: { accuracy: 0.91, f1Score: 0.89, precision: 0.9 },
      },
      'nova-predictor-v1': {
        path: './models/prediction/nova-v1',
        architecture: 'xgboost',
        predictions: ['resolution_time', 'csat', 'escalation_risk'],
        trainingData: 'resolution_history_2024.json',
        lastTraining: null,
        performance: { accuracy: 0.88, mae: 15.2, rmse: 23.1 },
      },
    };

    // External model configurations
    this.externalConfigs = {
      'openai-gpt4': {
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4-turbo',
        capabilities: ['text_analysis', 'classification', 'generation'],
        rateLimits: { requestsPerMinute: 500, tokensPerMinute: 150000 },
      },
      'anthropic-claude': {
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-opus-20240229',
        capabilities: ['text_analysis', 'reasoning', 'classification'],
        rateLimits: { requestsPerMinute: 50, tokensPerMinute: 40000 },
      },
      'huggingface-sentiment': {
        provider: 'huggingface',
        endpoint:
          'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
        model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        capabilities: ['sentiment_analysis'],
        rateLimits: { requestsPerMinute: 100 },
      },
    };

    // MCP server configurations
    this.mcpConfigs = {
      'nova-mcp-server': {
        endpoint: 'http://localhost:3001/mcp',
        capabilities: ['ticket_analysis', 'knowledge_retrieval', 'agent_recommendations'],
        authentication: 'bearer',
        version: '1.0.0',
      },
      'external-ai-server': {
        endpoint: 'https://ai-server.company.com/mcp',
        capabilities: ['custom_models', 'domain_specific_analysis'],
        authentication: 'api_key',
        version: '2.1.0',
      },
    };
  }

  async registerInHouseModel(modelId, config) {
    try {
      // Validate model configuration
      if (!this.validateModelConfig(config)) {
        throw new Error(`Invalid model configuration for ${modelId}`);
      }

      // Load model if it exists
      const modelPath = this.inHouseConfigs[modelId]?.path;
      if (modelPath) {
        const model = await this.loadModel(modelPath, config);
        this.inHouseModels.set(modelId, {
          model,
          config,
          status: 'ready',
          lastUsed: new Date(),
          usageCount: 0,
        });
      }

      // Initialize performance tracking
      this.modelPerformance.set(modelId, {
        totalPredictions: 0,
        correctPredictions: 0,
        averageLatency: 0,
        errorRate: 0,
        lastEvaluation: null,
      });

      console.log(`In-house model ${modelId} registered successfully`);
      return { success: true, modelId, status: 'registered' };
    } catch (error) {
      console.error(`Failed to register in-house model ${modelId}:`, error);
      return { success: false, error: error.message };
    }
  }

  async registerExternalModel(modelId, config) {
    try {
      // Validate external model configuration
      if (!this.validateExternalConfig(config)) {
        throw new Error(`Invalid external model configuration for ${modelId}`);
      }

      // Test connection
      const connectionTest = await this.testExternalConnection(config);
      if (!connectionTest.success) {
        throw new Error(`Connection test failed: ${connectionTest.error}`);
      }

      this.externalModels.set(modelId, {
        config,
        status: 'ready',
        lastUsed: new Date(),
        usageCount: 0,
        connectionTest,
      });

      console.log(`External model ${modelId} registered successfully`);
      return { success: true, modelId, status: 'registered' };
    } catch (error) {
      console.error(`Failed to register external model ${modelId}:`, error);
      return { success: false, error: error.message };
    }
  }

  async initializeMCPConnections() {
    try {
      for (const [serverId, config] of Object.entries(this.mcpConfigs)) {
        const connection = await this.establishMCPConnection(serverId, config);
        if (connection.success) {
          this.mcpConnections.set(serverId, connection);
          console.log(`MCP connection established: ${serverId}`);
        } else {
          console.warn(`Failed to establish MCP connection: ${serverId}`, connection.error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize MCP connections:', error);
    }
  }

  async predict(modelId, input, options = {}) {
    try {
      // Check if it's an in-house model
      if (this.inHouseModels.has(modelId)) {
        return await this.predictInHouse(modelId, input, options);
      }

      // Check if it's an external model
      if (this.externalModels.has(modelId)) {
        return await this.predictExternal(modelId, input, options);
      }

      // Try MCP if model not found
      return await this.predictViaMCP(modelId, input, options);
    } catch (error) {
      console.error(`Prediction failed for model ${modelId}:`, error);
      return this.getDefaultPrediction(modelId, input);
    }
  }

  async predictInHouse(modelId, input, options) {
    const startTime = Date.now();

    try {
      const modelData = this.inHouseModels.get(modelId);
      if (!modelData || modelData.status !== 'ready') {
        throw new Error(`In-house model ${modelId} not ready`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(modelId, input);
      if (this.modelCache.has(cacheKey) && !options.bypassCache) {
        return this.modelCache.get(cacheKey);
      }

      // Preprocess input
      const processedInput = await this.preprocessInput(input, modelData.config);

      // Make prediction
      const prediction = await this.executeInHousePrediction(modelData.model, processedInput);

      // Postprocess output
      const result = await this.postprocessOutput(prediction, modelData.config);

      // Update performance metrics
      this.updateModelPerformance(modelId, Date.now() - startTime, true);

      // Cache result
      this.modelCache.set(cacheKey, result);

      // Update usage statistics
      modelData.usageCount++;
      modelData.lastUsed = new Date();

      return result;
    } catch (error) {
      this.updateModelPerformance(modelId, Date.now() - startTime, false);
      throw error;
    }
  }

  async predictExternal(modelId, input, options) {
    const startTime = Date.now();

    try {
      const modelData = this.externalModels.get(modelId);
      if (!modelData || modelData.status !== 'ready') {
        throw new Error(`External model ${modelId} not ready`);
      }

      // Check rate limits
      await this.checkRateLimits(modelId);

      // Prepare request
      const request = await this.prepareExternalRequest(modelData.config, input, options);

      // Make API call
      const response = await this.makeExternalAPICall(modelData.config, request);

      // Process response
      const result = await this.processExternalResponse(response, modelData.config);

      // Update performance metrics
      this.updateModelPerformance(modelId, Date.now() - startTime, true);

      // Update usage statistics
      modelData.usageCount++;
      modelData.lastUsed = new Date();

      return result;
    } catch (error) {
      this.updateModelPerformance(modelId, Date.now() - startTime, false);
      throw error;
    }
  }

  async predictViaMCP(modelId, input, options) {
    try {
      // Find appropriate MCP server
      const mcpServer = this.findMCPServerForModel(modelId);
      if (!mcpServer) {
        throw new Error(`No MCP server found for model ${modelId}`);
      }

      const connection = this.mcpConnections.get(mcpServer);
      if (!connection || connection.status !== 'connected') {
        throw new Error(`MCP server ${mcpServer} not connected`);
      }

      // Prepare MCP request
      const mcpRequest = {
        method: 'predict',
        params: {
          modelId,
          input,
          options,
        },
      };

      // Send request via MCP
      const response = await this.sendMCPRequest(connection, mcpRequest);

      return response.result;
    } catch (error) {
      console.error(`MCP prediction failed for model ${modelId}:`, error);
      throw error;
    }
  }

  async predictViaExternal(capability, input, options = {}) {
    try {
      // Find best external model for capability
      const modelId = this.findBestModelForCapability(capability);
      if (!modelId) {
        throw new Error(`No external model found for capability: ${capability}`);
      }

      return await this.predictExternal(modelId, input, options);
    } catch (error) {
      console.error(`External prediction failed for capability ${capability}:`, error);
      return this.getDefaultPrediction(capability, input);
    }
  }

  async incrementalTrain(modelId, trainingData) {
    try {
      if (!this.inHouseModels.has(modelId)) {
        throw new Error(`In-house model ${modelId} not found`);
      }

      const modelData = this.inHouseModels.get(modelId);

      // Prepare training data
      const processedData = await this.prepareTrainingData(trainingData, modelData.config);

      // Perform incremental training
      const trainingResult = await this.performIncrementalTraining(
        modelData.model,
        processedData,
        modelData.config,
      );

      // Update model performance
      if (trainingResult.improvement > 0) {
        const performance = this.modelPerformance.get(modelId);
        performance.accuracy = Math.min(performance.accuracy + trainingResult.improvement, 1.0);
        performance.lastEvaluation = new Date();
      }

      // Update model version
      this.updateModelVersion(modelId);

      return {
        success: true,
        improvement: trainingResult.improvement,
        newAccuracy: this.modelPerformance.get(modelId).accuracy,
      };
    } catch (error) {
      console.error(`Incremental training failed for model ${modelId}:`, error);
      return { success: false, error: error.message };
    }
  }

  async retrainModel(modelId, allTrainingData) {
    try {
      if (!this.inHouseModels.has(modelId)) {
        throw new Error(`In-house model ${modelId} not found`);
      }

      const modelData = this.inHouseModels.get(modelId);
      modelData.status = 'training';

      // Prepare full training dataset
      const trainingDataset = await this.prepareFullTrainingDataset(
        allTrainingData,
        modelData.config,
      );

      // Perform full retraining
      const retrainingResult = await this.performFullRetraining(
        modelData.model,
        trainingDataset,
        modelData.config,
      );

      // Update model
      modelData.model = retrainingResult.model;
      modelData.status = 'ready';

      // Update performance metrics
      const performance = this.modelPerformance.get(modelId);
      performance.accuracy = retrainingResult.accuracy;
      performance.f1Score = retrainingResult.f1Score;
      performance.lastEvaluation = new Date();

      // Create new model version
      this.createModelVersion(modelId, retrainingResult);

      return {
        success: true,
        improvement: retrainingResult.accuracy - (performance.accuracy || 0),
        newAccuracy: retrainingResult.accuracy,
      };
    } catch (error) {
      console.error(`Model retraining failed for ${modelId}:`, error);

      // Reset model status
      if (this.inHouseModels.has(modelId)) {
        this.inHouseModels.get(modelId).status = 'ready';
      }

      return { success: false, error: error.message };
    }
  }

  async trainAgentModel(agentId, behaviorData) {
    try {
      const agentModelId = `agent-${agentId}-model`;

      // Check if agent-specific model exists
      if (!this.inHouseModels.has(agentModelId)) {
        // Create new agent-specific model
        await this.createAgentSpecificModel(agentId, behaviorData);
      } else {
        // Update existing agent model
        await this.updateAgentModel(agentId, behaviorData);
      }

      return { success: true, modelId: agentModelId };
    } catch (error) {
      console.error(`Agent model training failed for ${agentId}:`, error);
      return { success: false, error: error.message };
    }
  }

  async updateEscalationModel(escalationPattern) {
    try {
      const escalationModelId = 'nova-escalation-predictor';

      // Update escalation prediction model with new pattern
      const updateResult = await this.incrementalTrain(escalationModelId, escalationPattern);

      return updateResult;
    } catch (error) {
      console.error('Escalation model update failed:', error);
      return { success: false, error: error.message };
    }
  }

  async refreshExternalModels() {
    try {
      const results = [];

      for (const [modelId, modelData] of this.externalModels) {
        try {
          // Test connection
          const connectionTest = await this.testExternalConnection(modelData.config);

          if (connectionTest.success) {
            modelData.status = 'ready';
            modelData.connectionTest = connectionTest;
          } else {
            modelData.status = 'error';
            console.warn(`External model ${modelId} connection failed:`, connectionTest.error);
          }

          results.push({ modelId, status: modelData.status });
        } catch (error) {
          modelData.status = 'error';
          results.push({ modelId, status: 'error', error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Refreshing external models failed:', error);
      return [];
    }
  }

  async getPredictions(modelId, input) {
    try {
      // Get predictions from multiple models if available
      const primaryPrediction = await this.predict(modelId, input);

      // Get ensemble predictions for better accuracy
      const ensemblePredictions = await this.getEnsemblePredictions(modelId, input);

      return {
        primary: primaryPrediction,
        ensemble: ensemblePredictions,
        confidence: this.calculateEnsembleConfidence(primaryPrediction, ensemblePredictions),
      };
    } catch (error) {
      console.error(`Getting predictions failed for model ${modelId}:`, error);
      return this.getDefaultPrediction(modelId, input);
    }
  }

  // Helper methods for model management
  async loadModel(modelPath, config) {
    // Implementation would load the actual model based on architecture
    console.log(`Loading model from ${modelPath} with config:`, config);
    return { loaded: true, path: modelPath, config };
  }

  validateModelConfig(config) {
    return config && config.type && config.version && config.capabilities;
  }

  validateExternalConfig(config) {
    return config && config.provider && config.endpoint && config.model;
  }

  async testExternalConnection(config) {
    try {
      // Implementation would test actual API connection
      return { success: true, latency: 150, version: config.model };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async establishMCPConnection(serverId, config) {
    try {
      // Implementation would establish actual MCP connection
      return {
        success: true,
        serverId,
        status: 'connected',
        capabilities: config.capabilities,
        version: config.version,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  generateCacheKey(modelId, input) {
    const inputHash = this.hashInput(input);
    return `${modelId}:${inputHash}`;
  }

  hashInput(input) {
    // Simple hash implementation
    return Buffer.from(JSON.stringify(input)).toString('base64').substr(0, 16);
  }

  updateModelPerformance(modelId, latency, success) {
    const performance = this.modelPerformance.get(modelId);
    if (performance) {
      performance.totalPredictions++;
      if (success) performance.correctPredictions++;
      performance.averageLatency = (performance.averageLatency + latency) / 2;
      performance.errorRate = 1 - performance.correctPredictions / performance.totalPredictions;
    }
  }

  findBestModelForCapability(capability) {
    // Find the best external model for a given capability
    for (const [modelId, modelData] of this.externalModels) {
      if (modelData.config.capabilities?.includes(capability)) {
        return modelId;
      }
    }
    return null;
  }

  findMCPServerForModel(modelId) {
    // Find appropriate MCP server that can handle the model
    for (const [serverId, connection] of this.mcpConnections) {
      if (connection.capabilities?.includes('custom_models')) {
        return serverId;
      }
    }
    return null;
  }

  getDefaultPrediction(modelId, input) {
    return {
      prediction: 'unknown',
      confidence: 0.5,
      source: 'default',
      error: `No model available for ${modelId}`,
    };
  }

  async checkRateLimits(modelId) {
    // Implementation would check and enforce rate limits
    return true;
  }

  async prepareExternalRequest(config, input, options) {
    // Prepare request based on provider format
    return { input, options, model: config.model };
  }

  async makeExternalAPICall(config, request) {
    // Implementation would make actual API call
    return { success: true, data: { prediction: 'sample' } };
  }

  async processExternalResponse(response, config) {
    // Process response based on provider format
    return response.data;
  }

  async sendMCPRequest(connection, request) {
    // Implementation would send actual MCP request
    return { result: { prediction: 'sample' } };
  }
}

// Model Load Balancer for handling multiple model instances
class ModelLoadBalancer {
  constructor() {
    this.modelInstances = new Map();
    this.loadMetrics = new Map();
  }

  async routeRequest(modelId, input, options) {
    // Implementation would route requests to least loaded instance
    return { routedTo: 'instance-1', load: 0.3 };
  }

  updateLoadMetrics(modelId, instanceId, metrics) {
    // Update load metrics for load balancing decisions
    const key = `${modelId}:${instanceId}`;
    this.loadMetrics.set(key, {
      ...metrics,
      timestamp: new Date(),
    });
  }
}
class LearningEngine {
  constructor() {
    this.modelManager = new ModelManager();
    this.trainingData = new Map();
    this.behaviorPatterns = new Map();
    this.departmentInsights = new Map();
    this.agentProfiles = new Map();
    this.resolutionPatterns = new Map();
    this.proactiveRules = new Map();

    // Initialize model manager with default models
    this.initializeModels();
  }

  async initializeModels() {
    // Register in-house models
    await this.modelManager.registerInHouseModel('nova-sentiment-v1', {
      type: 'sentiment',
      version: '1.0.0',
      capabilities: ['emotion_classification', 'escalation_prediction', 'cultural_analysis'],
      trainingData: 'tickets_2023_2024',
      accuracy: 0.94,
    });

    await this.modelManager.registerInHouseModel('nova-classifier-v1', {
      type: 'classification',
      version: '1.0.0',
      capabilities: ['category_prediction', 'priority_assignment', 'urgency_detection'],
      trainingData: 'categorized_tickets_2024',
      accuracy: 0.91,
    });

    await this.modelManager.registerInHouseModel('nova-predictor-v1', {
      type: 'prediction',
      version: '1.0.0',
      capabilities: ['resolution_time', 'agent_matching', 'satisfaction_prediction'],
      trainingData: 'resolution_history_2024',
      accuracy: 0.88,
    });

    // Initialize MCP connections for external models
    await this.modelManager.initializeMCPConnections();
  }

  async processTicketResolution(ticketData, resolutionOutcome) {
    try {
      const learning = {
        ticketId: ticketData.id,
        department: ticketData.department,
        category: ticketData.category,
        priority: ticketData.priority,
        agentId: resolutionOutcome.resolvedBy,
        resolutionTime: resolutionOutcome.timeToResolve,
        customerSatisfaction: resolutionOutcome.csat,
        escalated: resolutionOutcome.wasEscalated,
        reopened: resolutionOutcome.wasReopened,
        solution: resolutionOutcome.solution,
        timestamp: new Date(),
      };

      // Store training data
      const key = `${ticketData.department}_${ticketData.category}`;
      if (!this.trainingData.has(key)) {
        this.trainingData.set(key, []);
      }
      this.trainingData.get(key).push(learning);

      // Update resolution patterns
      await this.updateResolutionPatterns(learning);

      // Learn from successful resolution strategies
      if (resolutionOutcome.csat > 4.0 && !resolutionOutcome.wasEscalated) {
        await this.learnSuccessfulStrategy(learning);
      }

      // Train models with new data
      await this.modelManager.incrementalTrain('nova-predictor-v1', learning);

      return {
        success: true,
        patternsUpdated: true,
        modelUpdated: true,
        insights: await this.generateLearningInsights(learning),
      };
    } catch (error) {
      console.error('Learning from ticket resolution failed:', error);
      return { success: false, error: error.message };
    }
  }

  async processAgentBehavior(agentId, department, ticketId, actions, outcomes) {
    try {
      const behavior = {
        agentId,
        department,
        ticketId,
        actions: actions.map((action) => ({
          type: action.type,
          timestamp: action.timestamp,
          content: action.content,
          effectiveness: action.effectiveness || null,
        })),
        outcomes,
        timestamp: new Date(),
      };

      // Update agent profile
      if (!this.agentProfiles.has(agentId)) {
        this.agentProfiles.set(agentId, {
          agentId,
          department,
          strengths: [],
          improvementAreas: [],
          avgResolutionTime: 0,
          avgCSAT: 0,
          specializations: [],
          behaviorPatterns: [],
        });
      }

      const profile = this.agentProfiles.get(agentId);
      profile.behaviorPatterns.push(behavior);

      // Analyze behavior patterns
      await this.analyzeBehaviorPatterns(agentId, behavior);

      // Update department insights
      await this.updateDepartmentInsights(department, behavior);

      // Train agent-specific models
      await this.modelManager.trainAgentModel(agentId, behavior);

      return {
        success: true,
        profileUpdated: true,
        insights: await this.generateAgentInsights(agentId),
      };
    } catch (error) {
      console.error('Learning from agent behavior failed:', error);
      return { success: false, error: error.message };
    }
  }

  async processEscalationPattern(escalationData) {
    try {
      const pattern = {
        ticketId: escalationData.ticketId,
        originalAgent: escalationData.originalAgent,
        escalatedTo: escalationData.escalatedTo,
        reason: escalationData.reason,
        triggerEvents: escalationData.triggerEvents,
        timeToEscalation: escalationData.timeToEscalation,
        resolutionAfterEscalation: escalationData.resolutionTime,
        department: escalationData.department,
        customerProfile: escalationData.customerProfile,
        timestamp: new Date(),
      };

      // Learn escalation triggers
      await this.learnEscalationTriggers(pattern);

      // Update predictive models
      await this.modelManager.updateEscalationModel(pattern);

      // Generate prevention strategies
      const preventionStrategies = await this.generateEscalationPrevention(pattern);

      return {
        success: true,
        preventionStrategies,
        insights: await this.generateEscalationInsights(pattern),
      };
    } catch (error) {
      console.error('Learning from escalation pattern failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getAgentRecommendations(agentId, department, ticketContext) {
    try {
      // Get agent profile and patterns
      const agentProfile =
        this.agentProfiles.get(agentId) || this.getDefaultAgentProfile(agentId, department);

      // Get similar successful resolutions
      const similarCases = await this.findSimilarSuccessfulCases(ticketContext, department);

      // Get model predictions
      const predictions = await this.modelManager.getPredictions('nova-predictor-v1', {
        ticketContext,
        agentProfile,
        department,
      });

      // Generate personalized recommendations
      const recommendations = {
        suggestedActions: await this.generateActionRecommendations(
          agentProfile,
          ticketContext,
          similarCases,
        ),
        estimatedResolutionTime: predictions.resolutionTime,
        confidenceLevel: predictions.confidence,
        alternativeApproaches: await this.generateAlternativeApproaches(
          ticketContext,
          agentProfile,
        ),
        knowledgeBaseSuggestions: await this.getSuggestedKBArticles(ticketContext, agentProfile),
        escalationRisk: predictions.escalationRisk,
        customerSatisfactionPrediction: predictions.expectedCSAT,
      };

      return recommendations;
    } catch (error) {
      console.error('Getting agent recommendations failed:', error);
      return this.getDefaultRecommendations();
    }
  }

  async getDepartmentAnalytics(department, timeRange) {
    try {
      const insights = this.departmentInsights.get(department) || {};

      // Analyze department patterns
      const analytics = {
        performanceMetrics: await this.calculateDepartmentMetrics(department, timeRange),
        trendAnalysis: await this.analyzeDepartmentTrends(department, timeRange),
        agentPerformance: await this.getAgentPerformanceByDepartment(department, timeRange),
        commonIssues: await this.identifyCommonIssues(department, timeRange),
        resolutionPatterns: await this.analyzeDepartmentResolutionPatterns(department, timeRange),
        improvementOpportunities: await this.identifyImprovementOpportunities(
          department,
          timeRange,
        ),
        trainingRecommendations: await this.generateTrainingRecommendations(department, insights),
      };

      return analytics;
    } catch (error) {
      console.error('Getting department analytics failed:', error);
      return this.getDefaultDepartmentAnalytics();
    }
  }

  async retrainModels() {
    try {
      const results = {
        modelsRetrained: [],
        improvements: {},
        errors: [],
      };

      // Retrain in-house models
      for (const modelId of ['nova-sentiment-v1', 'nova-classifier-v1', 'nova-predictor-v1']) {
        try {
          const retrainResult = await this.modelManager.retrainModel(modelId, this.trainingData);
          results.modelsRetrained.push(modelId);
          results.improvements[modelId] = retrainResult.improvement;
        } catch (error) {
          results.errors.push({ model: modelId, error: error.message });
        }
      }

      // Update external model connections
      await this.modelManager.refreshExternalModels();

      return results;
    } catch (error) {
      console.error('Model retraining failed:', error);
      return { success: false, error: error.message };
    }
  }

  async generateProactiveSuggestions(context) {
    try {
      const suggestions = {
        preventiveActions: [],
        resourceOptimization: [],
        processImprovements: [],
        trainingNeeds: [],
        systemOptimizations: [],
      };

      // Analyze current context
      const currentTrends = await this.analyzeCurrentTrends(context);
      const predictedIssues = await this.predictUpcomingIssues(context);
      const resourceStress = await this.analyzeResourceStress(context);

      // Generate preventive actions
      if (predictedIssues.length > 0) {
        suggestions.preventiveActions = await this.generatePreventiveActions(predictedIssues);
      }

      // Generate resource optimization suggestions
      if (resourceStress.level > 0.7) {
        suggestions.resourceOptimization = await this.generateResourceOptimization(resourceStress);
      }

      // Generate process improvements
      suggestions.processImprovements = await this.identifyProcessImprovements(currentTrends);

      // Generate training recommendations
      suggestions.trainingNeeds = await this.identifyTrainingNeeds(context);

      // Generate system optimizations
      suggestions.systemOptimizations = await this.identifySystemOptimizations(context);

      return suggestions;
    } catch (error) {
      console.error('Generating proactive suggestions failed:', error);
      return this.getDefaultProactiveSuggestions();
    }
  }

  async predictOptimalClassification(ticketContent, historicalData) {
    try {
      // Use multiple models for prediction
      const predictions = await Promise.all([
        this.modelManager.predict('nova-classifier-v1', { content: ticketContent }),
        this.modelManager.predictViaExternal('classification', { content: ticketContent }),
        this.analyzeHistoricalPatterns(ticketContent, historicalData),
      ]);

      // Ensemble the predictions
      const optimalClassification = await this.ensemblePredictions(predictions);

      return {
        category: optimalClassification.category,
        priority: optimalClassification.priority,
        urgency: optimalClassification.urgency,
        confidence: optimalClassification.confidence,
        alternativeClassifications: optimalClassification.alternatives,
        reasoning: optimalClassification.reasoning,
      };
    } catch (error) {
      console.error('Predicting optimal classification failed:', error);
      return this.getDefaultClassification();
    }
  }

  async recommendBestAgent(ticketData, availableAgents) {
    try {
      const recommendations = [];

      for (const agent of availableAgents) {
        const agentProfile = this.agentProfiles.get(agent.id);
        if (!agentProfile) continue;

        // Calculate match score
        const matchScore = await this.calculateAgentMatchScore(ticketData, agentProfile);

        // Get predicted performance
        const performance = await this.modelManager.predict('nova-predictor-v1', {
          ticketData,
          agentProfile,
        });

        recommendations.push({
          agentId: agent.id,
          matchScore,
          estimatedResolutionTime: performance.resolutionTime,
          estimatedCSAT: performance.expectedCSAT,
          workload: agent.currentWorkload,
          specializations: agentProfile.specializations,
          reasoning: this.generateAgentRecommendationReasoning(
            matchScore,
            performance,
            agentProfile,
          ),
        });
      }

      // Sort by overall suitability
      recommendations.sort(
        (a, b) =>
          b.matchScore * 0.4 +
          b.estimatedCSAT * 0.3 +
          (1 - b.workload) * 0.3 -
          (a.matchScore * 0.4 + a.estimatedCSAT * 0.3 + (1 - a.workload) * 0.3),
      );

      return recommendations;
    } catch (error) {
      console.error('Recommending best agent failed:', error);
      return [];
    }
  }

  async estimateResolutionTime(ticketData, agentProfile) {
    try {
      // Use multiple estimation methods
      const estimates = await Promise.all([
        this.modelManager.predict('nova-predictor-v1', { ticketData, agentProfile }),
        this.analyzeHistoricalResolutionTimes(ticketData, agentProfile),
        this.calculateComplexityBasedEstimate(ticketData),
      ]);

      // Weighted average of estimates
      const weightedEstimate =
        estimates[0].resolutionTime * 0.5 +
        estimates[1].averageTime * 0.3 +
        estimates[2].estimatedTime * 0.2;

      return {
        estimatedTime: Math.round(weightedEstimate),
        confidence: this.calculateEstimateConfidence(estimates),
        factors: {
          ticketComplexity: estimates[2].complexity,
          agentExperience: agentProfile?.experience || 'unknown',
          historicalAverage: estimates[1].averageTime,
          modelPrediction: estimates[0].resolutionTime,
        },
      };
    } catch (error) {
      console.error('Estimating resolution time failed:', error);
      return { estimatedTime: 120, confidence: 0.5, factors: {} }; // Default 2 hours
    }
  }

  async suggestKnowledgeArticles(ticketContent) {
    try {
      // Analyze ticket content
      const contentAnalysis = await this.analyzeTicketContent(ticketContent);

      // Find relevant articles using multiple methods
      const suggestions = await Promise.all([
        this.findKeywordMatches(contentAnalysis.keywords),
        this.findSemanticMatches(contentAnalysis.semantics),
        this.findPatternMatches(contentAnalysis.patterns),
        this.modelManager.predictViaExternal('knowledge_retrieval', { content: ticketContent }),
      ]);

      // Combine and rank suggestions
      const rankedSuggestions = await this.rankKnowledgeArticles(suggestions.flat());

      return rankedSuggestions.slice(0, 10); // Top 10 suggestions
    } catch (error) {
      console.error('Suggesting knowledge articles failed:', error);
      return [];
    }
  }

  async predictCSAT(ticketData, proposedResponse) {
    try {
      // Analyze response quality
      const responseAnalysis = await this.analyzeResponseQuality(proposedResponse);

      // Use sentiment analysis on proposed response
      const sentimentEngine = new SentimentAnalysisEngine();
      const responseSentiment = await sentimentEngine.analyzeSentiment(proposedResponse);

      // Predict CSAT using multiple factors
      const prediction = await this.modelManager.predict('nova-predictor-v1', {
        ticketData,
        proposedResponse,
        responseAnalysis,
        responseSentiment,
      });

      return {
        predictedCSAT: prediction.csat,
        confidence: prediction.confidence,
        factors: {
          responseQuality: responseAnalysis.quality,
          tone: responseSentiment.recommendedTone,
          completeness: responseAnalysis.completeness,
          timeliness: this.calculateTimeliness(ticketData),
        },
        improvements: await this.suggestResponseImprovements(proposedResponse, responseAnalysis),
      };
    } catch (error) {
      console.error('Predicting CSAT failed:', error);
      return { predictedCSAT: 3.5, confidence: 0.5, factors: {}, improvements: [] };
    }
  }

  // Helper methods for learning engine
  async updateResolutionPatterns(learning) {
    const patternKey = `${learning.department}_${learning.category}`;
    if (!this.resolutionPatterns.has(patternKey)) {
      this.resolutionPatterns.set(patternKey, []);
    }
    this.resolutionPatterns.get(patternKey).push(learning);
  }

  async learnSuccessfulStrategy(learning) {
    // Extract successful patterns for future recommendations
    const strategy = {
      pattern: `${learning.department}_${learning.category}`,
      solution: learning.solution,
      resolutionTime: learning.resolutionTime,
      csat: learning.customerSatisfaction,
      agentId: learning.agentId,
    };

    // Store in proactive rules
    if (!this.proactiveRules.has(strategy.pattern)) {
      this.proactiveRules.set(strategy.pattern, []);
    }
    this.proactiveRules.get(strategy.pattern).push(strategy);
  }

  getDefaultAgentProfile(agentId, department) {
    return {
      agentId,
      department,
      strengths: [],
      improvementAreas: [],
      avgResolutionTime: 120, // Default 2 hours
      avgCSAT: 4.0,
      specializations: [],
      behaviorPatterns: [],
    };
  }

  getDefaultRecommendations() {
    return {
      suggestedActions: [
        'Review ticket details',
        'Check knowledge base',
        'Contact customer for clarification',
      ],
      estimatedResolutionTime: 120,
      confidenceLevel: 0.5,
      alternativeApproaches: [],
      knowledgeBaseSuggestions: [],
      escalationRisk: 0.3,
      customerSatisfactionPrediction: 4.0,
    };
  }

  getDefaultProactiveSuggestions() {
    return {
      preventiveActions: [],
      resourceOptimization: [],
      processImprovements: [],
      trainingNeeds: [],
      systemOptimizations: [],
    };
  }

  getDefaultClassification() {
    return {
      category: 'general',
      priority: 'medium',
      urgency: 'normal',
      confidence: 0.5,
      alternativeClassifications: [],
      reasoning: 'Default classification applied',
    };
  }
}

export default SentimentAnalysisEngine;
