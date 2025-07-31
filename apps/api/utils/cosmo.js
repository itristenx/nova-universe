import axios from 'axios';
import { logger } from '../logger.js';

const COSMO_URL = process.env.COSMO_API_URL || 'http://localhost:5005';

/**
 * Send a chat message to the Cosmo service.
 * @param {object} params
 * @param {string} params.userId - ID of the user sending the message
 * @param {string} params.message - Message text
 * @param {string} [params.conversationId] - Existing conversation ID
 * @returns {Promise<object>} Response from Cosmo
 */
export async function sendCosmoMessage({ userId, message, conversationId }) {
  try {
    const { data } = await axios.post(
      `${COSMO_URL}/v1/chat`,
      { userId, message, conversationId }
    );
    return data;
  } catch (err) {
    logger.error('Error communicating with Cosmo', err);
    throw err;
  }
}

/**
 * Notify Cosmo that a VIP ticket requires escalation.
 * @param {string} ticketId
 * @param {string} reason
 */
export async function notifyCosmoEscalation(ticketId, reason) {
  try {
    await axios.post(`${COSMO_URL}/v1/escalate`, { ticketId, reason });
    logger.info(`Cosmo escalation for ticket ${ticketId}: ${reason}`);
  } catch (err) {
    logger.error('Failed to notify Cosmo escalation', err);
  }
}
