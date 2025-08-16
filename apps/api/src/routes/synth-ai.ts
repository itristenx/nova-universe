import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Synth AI Insights Request Schema
const monitoringInsightsSchema = z.object({
  monitors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    current_status: z.boolean(),
    uptime_24h: z.number().optional(),
    uptime_7d: z.number().optional(),
    uptime_30d: z.number().optional(),
    avg_response_time_24h: z.number().optional()
  })).max(15),
  incidents: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string(),
    severity: z.string(),
    started_at: z.string(),
    resolved_at: z.string().optional()
  })).max(25),
  request_type: z.literal('monitoring_analysis'),
  role: z.enum(['admin', 'technician', 'user']).optional()
});

const technicianInsightsSchema = z.object({
  incidents: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string(),
    severity: z.string(),
    started_at: z.string(),
    affected_monitors: z.array(z.string()).optional()
  })).max(20),
  monitors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    current_status: z.boolean(),
    uptime_24h: z.number().optional()
  })).max(15),
  request_type: z.literal('technician_analysis'),
  role: z.literal('technician')
});

// Generate AI-powered monitoring insights for admin dashboard
router.post('/monitoring-insights', 
  authenticateToken,
  validateRequest(monitoringInsightsSchema),
  async (req, res) => {
    try {
      const { monitors, incidents } = req.body;
      
      // Simulate AI analysis with realistic insights
      const downMonitors = monitors.filter((m: any) => !m.current_status);
      const criticalIncidents = incidents.filter((i: any) => i.severity === 'critical');
      const unresolvedIncidents = incidents.filter((i: any) => !i.resolved_at);
      
      // Calculate system metrics
      const totalMonitors = monitors.length;
      const upMonitors = totalMonitors - downMonitors.length;
      const systemEfficiency = totalMonitors > 0 ? Math.round((upMonitors / totalMonitors) * 100) : 100;
      
      // Determine risk level
      let riskLevel = 'LOW';
      if (criticalIncidents.length > 0 || downMonitors.length > 3) {
        riskLevel = 'HIGH';
      } else if (unresolvedIncidents.length > 2 || downMonitors.length > 1) {
        riskLevel = 'MEDIUM';
      }
      
      // Generate recommendations based on analysis
      const recommendations: string[] = [];
      
      if (downMonitors.length > 0) {
        recommendations.push(`Investigate ${downMonitors.length} down monitor${downMonitors.length > 1 ? 's' : ''}: ${downMonitors.map((m: any) => m.name).slice(0, 3).join(', ')}`);
      }
      
      if (criticalIncidents.length > 0) {
        recommendations.push(`Address ${criticalIncidents.length} critical incident${criticalIncidents.length > 1 ? 's' : ''} immediately`);
      }
      
      if (unresolvedIncidents.length > 0) {
        recommendations.push(`Follow up on ${unresolvedIncidents.length} unresolved incident${unresolvedIncidents.length > 1 ? 's' : ''}`);
      }
      
      const avgUptime = monitors.length > 0 
        ? monitors.reduce((acc: number, m: any) => acc + (m.uptime_24h || 0), 0) / monitors.length 
        : 100;
        
      if (avgUptime < 95) {
        recommendations.push('Consider implementing redundancy for improved uptime');
      }
      
      if (systemEfficiency > 98) {
        recommendations.push('System performing optimally - consider expanding monitoring coverage');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('All systems operational - monitor trends for potential issues');
      }
      
      const insights = {
        riskLevel,
        activeAlerts: unresolvedIncidents.length,
        systemEfficiency,
        recommendations: recommendations.slice(0, 5), // Limit to 5 recommendations
        generatedAt: new Date().toISOString(),
        analysisType: 'admin_monitoring'
      };
      
      res.json({ insights });
    } catch (error) {
      console.error('Failed to generate monitoring insights:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI insights',
        insights: {
          riskLevel: 'UNKNOWN',
          activeAlerts: 0,
          systemEfficiency: 0,
          recommendations: ['AI service temporarily unavailable'],
          generatedAt: new Date().toISOString(),
          analysisType: 'admin_monitoring'
        }
      });
    }
  }
);

// Generate AI-powered insights for technician dashboard
router.post('/technician-insights', 
  authenticateToken,
  validateRequest(technicianInsightsSchema),
  async (req, res) => {
    try {
      const { incidents, monitors } = req.body;
      
      // Technician-focused analysis
      const activeIncidents = incidents.filter((i: any) => i.status !== 'resolved');
      const criticalIncidents = incidents.filter((i: any) => i.severity === 'critical');
      const highPriorityIncidents = incidents.filter((i: any) => ['critical', 'high'].includes(i.severity));
      
      // Determine priority level for technician
      let priority = 'NORMAL';
      if (criticalIncidents.length > 0) {
        priority = 'HIGH';
      } else if (highPriorityIncidents.length > 1) {
        priority = 'MEDIUM';
      }
      
      // Generate technician-specific recommendations
      const recommendedActions: string[] = [];
      const escalationSuggestions: string[] = [];
      
      if (criticalIncidents.length > 0) {
        recommendedActions.push('Immediately escalate critical incidents to senior technicians');
        escalationSuggestions.push('Contact on-call engineer for critical system failures');
      }
      
      if (activeIncidents.length > 5) {
        recommendedActions.push('Prioritize incidents by severity and affected user count');
        escalationSuggestions.push('Consider requesting additional support resources');
      }
      
      const oldIncidents = incidents.filter((i: any) => {
        const startTime = new Date(i.started_at);
        const hoursSinceStart = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
        return hoursSinceStart > 4 && i.status !== 'resolved';
      });
      
      if (oldIncidents.length > 0) {
        recommendedActions.push(`Review ${oldIncidents.length} long-running incident${oldIncidents.length > 1 ? 's' : ''}`);
      }
      
      // Add default actions if none generated
      if (recommendedActions.length === 0) {
        recommendedActions.push('Monitor system status and respond to any new alerts');
        recommendedActions.push('Review incident patterns for preventive measures');
      }
      
      const insights = {
        priority,
        incidentCount: activeIncidents.length,
        recommendedActions: recommendedActions.slice(0, 5),
        escalationSuggestions: escalationSuggestions.slice(0, 3),
        generatedAt: new Date().toISOString(),
        analysisType: 'technician_workflow'
      };
      
      res.json({ insights });
    } catch (error) {
      console.error('Failed to generate technician insights:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI insights',
        insights: {
          priority: 'UNKNOWN',
          incidentCount: 0,
          recommendedActions: ['AI service temporarily unavailable'],
          escalationSuggestions: [],
          generatedAt: new Date().toISOString(),
          analysisType: 'technician_workflow'
        }
      });
    }
  }
);

export default router;
