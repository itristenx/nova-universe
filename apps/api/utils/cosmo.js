import { logger } from '../logger.js';

export async function notifyCosmoEscalation(ticketId, reason) {
  logger.info(`Cosmo escalation for ticket ${ticketId}: ${reason}`);
}
