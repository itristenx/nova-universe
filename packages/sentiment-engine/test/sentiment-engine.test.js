/**
 * Test suite for the Advanced Sentiment Analysis Engine
 */

import { SentimentAnalysisEngine } from '../index.js';

describe('SentimentAnalysisEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SentimentAnalysisEngine();
  });

  describe('analyzeSentiment', () => {
    test('should detect frustrated emotion correctly', async () => {
      const text =
        "I'm really frustrated with this system. It's been down for hours and I can't get any work done.";
      const result = await engine.analyzeSentiment(text);

      expect(result.primaryEmotion).toBe('frustrated');
      expect(result.emotionalFactors.frustration).toBeGreaterThan(0.5);
      expect(result.emotionalFactors.urgency).toBeGreaterThan(0.3);
      expect(result.recommendedTone).toBe('empathetic');
    });

    test('should detect angry emotion with escalation triggers', async () => {
      const text =
        "This is unacceptable! I want to speak to a manager immediately. This is the worst service I've ever experienced.";
      const result = await engine.analyzeSentiment(text);

      expect(result.primaryEmotion).toBe('angry');
      expect(result.escalationTriggers).toContain('speak to a manager');
      expect(result.escalationTriggers).toContain('unacceptable');
      expect(result.escalationTriggers).toContain('worst experience');
      expect(result.priorityAdjustment).toBeGreaterThan(0);
    });

    test('should detect confused emotion', async () => {
      const text =
        "I'm really confused about how to set this up. I don't understand the instructions and I'm not sure what to do next.";
      const result = await engine.analyzeSentiment(text);

      expect(result.primaryEmotion).toBe('confused');
      expect(result.emotionalFactors.confusion).toBeGreaterThan(0.5);
      expect(result.recommendedTone).toBe('reassuring');
    });

    test('should detect urgent requests', async () => {
      const text =
        'URGENT: Our production server is down and we need this fixed ASAP. This is critical for our business.';
      const result = await engine.analyzeSentiment(text);

      expect(result.primaryEmotion).toBe('urgent');
      expect(result.emotionalFactors.urgency).toBeGreaterThan(0.7);
      expect(result.priorityAdjustment).toBeGreaterThan(0);
    });

    test('should detect satisfied customers', async () => {
      const text =
        'Thank you so much for your help! This is working perfectly now. I really appreciate the excellent service.';
      const result = await engine.analyzeSentiment(text);

      expect(result.primaryEmotion).toBe('satisfied');
      expect(result.emotionalFactors.satisfaction).toBeGreaterThan(0.5);
      expect(result.priorityAdjustment).toBeLessThanOrEqual(0);
    });

    test('should detect calm, patient customers', async () => {
      const text =
        'Hi there, I have a small issue when you have time. No rush, whenever you get a chance to look at it would be great.';
      const result = await engine.analyzeSentiment(text);

      expect(result.primaryEmotion).toBe('calm');
      expect(result.emotionalFactors.urgency).toBeLessThan(0.3);
    });
  });

  describe('getEmotionalState', () => {
    test('should analyze customer emotional profile from history', async () => {
      const ticketHistory = [
        {
          content: "I'm having trouble with my computer",
          context: { timestamp: '2025-01-01' },
        },
        {
          content: "This is still not working and I'm getting frustrated",
          context: { timestamp: '2025-01-02' },
        },
        {
          content: "I need to speak to someone who knows what they're doing",
          context: { timestamp: '2025-01-03' },
        },
      ];

      const profile = await engine.getEmotionalState(ticketHistory);

      expect(profile.customerType).toBeDefined();
      expect(profile.communicationPreference).toBeDefined();
      expect(profile.historicalSatisfaction).toBeLessThan(0.5);
      expect(profile.churnRisk).toBeGreaterThan(0.3);
      expect(profile.sentimentTrend).toBeDefined();
    });

    test('should return default profile for empty history', async () => {
      const profile = await engine.getEmotionalState([]);

      expect(profile.customerType).toBe('regular_user');
      expect(profile.communicationPreference).toBe('professional');
      expect(profile.historicalSatisfaction).toBe(0.5);
      expect(profile.churnRisk).toBe(0.3);
    });
  });

  describe('predictEscalationRisk', () => {
    test('should predict high escalation risk for angry customers with triggers', async () => {
      const sentimentResult = {
        primaryEmotion: 'angry',
        intensity: 0.8,
        escalationTriggers: ['speak to manager', 'unacceptable'],
        emotionalFactors: {
          urgency: 0.7,
          frustration: 0.9,
          satisfaction: 0.1,
          confusion: 0.2,
        },
      };

      const metadata = {
        customerTier: 'enterprise',
        previousEscalations: 1,
        ticketAge: 72,
        reopenCount: 2,
      };

      const risk = await engine.predictEscalationRisk(sentimentResult, metadata);

      expect(risk.riskScore).toBeGreaterThan(0.7);
      expect(risk.riskLevel).toBe('critical');
      expect(risk.recommendations).toContain('Immediate escalation to senior support');
      expect(risk.recommendations).toContain('Manager notification required');
    });

    test('should predict low escalation risk for satisfied customers', async () => {
      const sentimentResult = {
        primaryEmotion: 'satisfied',
        intensity: 0.3,
        escalationTriggers: [],
        emotionalFactors: {
          urgency: 0.2,
          frustration: 0.1,
          satisfaction: 0.8,
          confusion: 0.1,
        },
      };

      const metadata = {
        customerTier: 'standard',
        previousEscalations: 0,
        ticketAge: 2,
        reopenCount: 0,
      };

      const risk = await engine.predictEscalationRisk(sentimentResult, metadata);

      expect(risk.riskScore).toBeLessThan(0.3);
      expect(risk.riskLevel).toBe('low');
      expect(risk.recommendations).toContain('Standard support process');
    });

    test('should predict medium risk for confused customers', async () => {
      const sentimentResult = {
        primaryEmotion: 'confused',
        intensity: 0.6,
        escalationTriggers: [],
        emotionalFactors: {
          urgency: 0.4,
          frustration: 0.3,
          satisfaction: 0.3,
          confusion: 0.7,
        },
      };

      const metadata = {
        customerTier: 'standard',
        previousEscalations: 0,
        ticketAge: 24,
        reopenCount: 1,
      };

      const risk = await engine.predictEscalationRisk(sentimentResult, metadata);

      expect(risk.riskScore).toBeGreaterThan(0.3);
      expect(risk.riskScore).toBeLessThan(0.7);
      expect(risk.riskLevel).toBe('medium');
    });
  });

  describe('calculateEmotionalFactors', () => {
    test('should calculate high urgency for urgent keywords', () => {
      const text = 'URGENT: System is down and we need this fixed immediately!';
      const factors = engine.calculateEmotionalFactors(text);

      expect(factors.urgency).toBeGreaterThan(0.5);
    });

    test('should calculate high frustration for frustrated language', () => {
      const text = "I'm so frustrated with this terrible system. This is ridiculous!";
      const factors = engine.calculateEmotionalFactors(text);

      expect(factors.frustration).toBeGreaterThan(0.5);
    });

    test('should calculate high satisfaction for positive feedback', () => {
      const text = 'Thank you so much! This is working perfectly now. Great job!';
      const factors = engine.calculateEmotionalFactors(text);

      expect(factors.satisfaction).toBeGreaterThan(0.5);
    });

    test('should calculate high confusion for unclear requests', () => {
      const text = "I'm really confused about this. I don't understand what I'm supposed to do.";
      const factors = engine.calculateEmotionalFactors(text);

      expect(factors.confusion).toBeGreaterThan(0.5);
    });
  });

  describe('findEscalationTriggers', () => {
    test('should find all escalation trigger phrases', () => {
      const text = 'This is unacceptable. I want to speak to a manager and file a complaint.';
      const triggers = engine.findEscalationTriggers(text);

      expect(triggers).toContain('unacceptable');
      expect(triggers).toContain('speak to a manager');
      expect(triggers).toContain('complaint');
      expect(triggers.length).toBeGreaterThanOrEqual(3);
    });

    test('should return empty array when no triggers found', () => {
      const text = 'I have a small question about setting up my email.';
      const triggers = engine.findEscalationTriggers(text);

      expect(triggers).toEqual([]);
    });
  });

  describe('determineRecommendedTone', () => {
    test('should recommend empathetic tone for high-intensity negative emotions', () => {
      const emotionResult = { primaryEmotion: 'angry', intensity: 0.8 };
      const culturalContext = { communicationStyle: 'direct' };

      const tone = engine.determineRecommendedTone(emotionResult, culturalContext);
      expect(tone).toBe('empathetic');
    });

    test('should recommend reassuring tone for confused customers', () => {
      const emotionResult = { primaryEmotion: 'confused', intensity: 0.6 };
      const culturalContext = { communicationStyle: 'balanced' };

      const tone = engine.determineRecommendedTone(emotionResult, culturalContext);
      expect(tone).toBe('reassuring');
    });

    test('should recommend technical tone for technical customers', () => {
      const emotionResult = { primaryEmotion: 'calm', intensity: 0.4 };
      const culturalContext = { communicationStyle: 'technical' };

      const tone = engine.determineRecommendedTone(emotionResult, culturalContext);
      expect(tone).toBe('technical');
    });

    test('should default to professional tone', () => {
      const emotionResult = { primaryEmotion: 'satisfied', intensity: 0.5 };
      const culturalContext = { communicationStyle: 'balanced' };

      const tone = engine.determineRecommendedTone(emotionResult, culturalContext);
      expect(tone).toBe('professional');
    });
  });

  describe('calculatePriorityAdjustment', () => {
    test('should increase priority for high-risk escalation scenarios', () => {
      const emotionResult = { primaryEmotion: 'angry' };
      const escalationRisk = { riskScore: 0.8 };
      const emotionalFactors = { urgency: 0.8, frustration: 0.9 };

      const adjustment = engine.calculatePriorityAdjustment(
        emotionResult,
        escalationRisk,
        emotionalFactors,
      );
      expect(adjustment).toBeGreaterThan(0);
      expect(adjustment).toBeLessThanOrEqual(3);
    });

    test('should decrease priority for satisfied customers with low urgency', () => {
      const emotionResult = { primaryEmotion: 'satisfied' };
      const escalationRisk = { riskScore: 0.1 };
      const emotionalFactors = { urgency: 0.2, frustration: 0.1 };

      const adjustment = engine.calculatePriorityAdjustment(
        emotionResult,
        escalationRisk,
        emotionalFactors,
      );
      expect(adjustment).toBeLessThanOrEqual(0);
      expect(adjustment).toBeGreaterThanOrEqual(-2);
    });
  });

  describe('error handling', () => {
    test('should handle invalid input gracefully', async () => {
      const result = await engine.analyzeSentiment('');
      expect(result).toBeDefined();
      expect(result.primaryEmotion).toBeDefined();
    });

    test('should handle null context', async () => {
      const result = await engine.analyzeSentiment('Test message', null);
      expect(result).toBeDefined();
    });

    test('should handle empty ticket history', async () => {
      const profile = await engine.getEmotionalState([]);
      expect(profile).toBeDefined();
      expect(profile.customerType).toBe('regular_user');
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete angry customer escalation scenario', async () => {
      const text =
        "This is absolutely unacceptable! Your system has been down for 3 hours and I need to speak to a manager right now. This is costing us money and I'm considering switching providers.";

      const sentiment = await engine.analyzeSentiment(text);
      const risk = await engine.predictEscalationRisk(sentiment, {
        customerTier: 'enterprise',
        previousEscalations: 1,
        ticketAge: 48,
        reopenCount: 1,
      });

      expect(sentiment.primaryEmotion).toBe('angry');
      expect(sentiment.escalationTriggers.length).toBeGreaterThan(2);
      expect(sentiment.priorityAdjustment).toBeGreaterThan(1);
      expect(risk.riskLevel).toBe('critical');
      expect(risk.recommendations).toContain('Immediate escalation to senior support');
    });

    test('should handle satisfied customer follow-up scenario', async () => {
      const ticketHistory = [
        { content: "My computer won't start", context: {} },
        { content: 'Thank you for the quick response!', context: {} },
        { content: 'Everything is working perfectly now. Great service!', context: {} },
      ];

      const profile = await engine.getEmotionalState(ticketHistory);
      const latestSentiment = await engine.analyzeSentiment(ticketHistory[2].content);

      expect(profile.historicalSatisfaction).toBeGreaterThan(0.6);
      expect(profile.churnRisk).toBeLessThan(0.4);
      expect(latestSentiment.primaryEmotion).toBe('satisfied');
      expect(latestSentiment.priorityAdjustment).toBeLessThanOrEqual(0);
    });
  });
});
