import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';

/**
 * Workflow Service - Manages ticket workflows and automation
 */
export class WorkflowService {
  /**
   * Start a workflow for a ticket
   */
  static async startWorkflow(ticketId, workflowId, user) {
    try {
      const workflow = await prisma.workflowDefinition.findUnique({
        where: { id: workflowId },
        include: { steps: { orderBy: { stepOrder: 'asc' } } },
      });

      if (!workflow || !workflow.isActive) {
        throw new Error('Workflow not found or inactive');
      }

      // Create workflow instance
      const instance = await prisma.workflowInstance.create({
        data: {
          ticketId,
          workflowDefinitionId: workflowId,
          status: 'ACTIVE',
          startedBy: user.id,
          currentStep: 0,
          context: {},
        },
      });

      // Execute first step if auto-start
      if (workflow.autoStart) {
        await this.executeNextStep(instance.id);
      }

      logger.info(`Started workflow ${workflowId} for ticket ${ticketId}`);
      return instance;
    } catch (error) {
      logger.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Execute the next step in a workflow
   */
  static async executeNextStep(instanceId) {
    try {
      const instance = await prisma.workflowInstance.findUnique({
        where: { id: instanceId },
        include: {
          workflowDefinition: {
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
          },
        },
      });

      if (!instance || instance.status !== 'ACTIVE') {
        return null;
      }

      const nextStep = instance.workflowDefinition.steps[instance.currentStep];
      if (!nextStep) {
        // Workflow completed
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
        return null;
      }

      // Execute step based on type
      await this.executeStep(instance, nextStep);

      // Move to next step
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStep: instance.currentStep + 1 },
      });

      return nextStep;
    } catch (error) {
      logger.error('Error executing workflow step:', error);
      throw error;
    }
  }

  /**
   * Execute a specific workflow step
   */
  static async executeStep(instance, step) {
    try {
      switch (step.stepType) {
        case 'ASSIGN':
          await this.executeAssignStep(instance, step);
          break;
        case 'APPROVE':
          await this.executeApprovalStep(instance, step);
          break;
        case 'NOTIFY':
          await this.executeNotificationStep(instance, step);
          break;
        case 'UPDATE_FIELD':
          await this.executeUpdateFieldStep(instance, step);
          break;
        case 'WAIT':
          await this.executeWaitStep(instance, step);
          break;
        default:
          logger.warn(`Unknown workflow step type: ${step.stepType}`);
      }
    } catch (error) {
      logger.error('Error executing workflow step:', error);
      throw error;
    }
  }

  /**
   * Execute assignment step
   */
  static async executeAssignStep(instance, step) {
    const { assignToUserId, assignToGroupId } = step.configuration;

    await prisma.enhancedSupportTicket.update({
      where: { id: instance.ticketId },
      data: {
        assignedToUserId: assignToUserId,
        assignedToGroupId: assignToGroupId,
        state: 'ASSIGNED',
      },
    });
  }

  /**
   * Execute approval step
   */
  static async executeApprovalStep(instance, step) {
    const { approverIds, approvalType } = step.configuration;

    // Create approval requests
    for (const approverId of approverIds) {
      await prisma.ticketApproval.create({
        data: {
          ticketId: instance.ticketId,
          approverId,
          approvalType: approvalType || 'REQUIRED',
          status: 'PENDING',
        },
      });
    }

    // Update ticket state
    await prisma.enhancedSupportTicket.update({
      where: { id: instance.ticketId },
      data: { state: 'PENDING_APPROVAL' },
    });
  }

  /**
   * Execute notification step
   */
  static async executeNotificationStep(instance, _step) {
    // This would integrate with NotificationService
    logger.info(`Executing notification step for ticket ${instance.ticketId}`);
  }

  /**
   * Execute field update step
   */
  static async executeUpdateFieldStep(instance, step) {
    const { field, value } = step.configuration;

    await prisma.enhancedSupportTicket.update({
      where: { id: instance.ticketId },
      data: { [field]: value },
    });
  }

  /**
   * Execute wait step
   */
  static async executeWaitStep(instance, step) {
    const { waitDuration } = step.configuration;

    // Schedule next step execution
    const executeAt = new Date();
    executeAt.setMinutes(executeAt.getMinutes() + waitDuration);

    // This would integrate with a job scheduler
    logger.info(`Workflow ${instance.id} waiting for ${waitDuration} minutes`);
  }

  /**
   * Get active workflows for a ticket
   */
  static async getTicketWorkflows(ticketId) {
    return await prisma.workflowInstance.findMany({
      where: { ticketId, status: 'ACTIVE' },
      include: { workflowDefinition: true },
    });
  }
}
