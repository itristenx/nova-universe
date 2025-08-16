import { PrismaClient } from '../../../../prisma/generated/core/index.js';
const prisma = new PrismaClient({ datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } } });

export interface IncidentData {
  title: string;
  description?: string;
  status?: string;
  severity?: string;
  affected_monitors?: string[];
  notify_subscribers?: boolean;
  user_id: string;
}

export interface UpdateIncidentData extends Partial<IncidentData> {}

export const _createIncident = async (data: IncidentData) => {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO nova_incidents (
        title, description, status, severity, affected_monitors,
        notify_subscribers, tenant_id, created_at, updated_at
      ) VALUES (
        ${data.title}, ${data.description || ''}, 
        ${data.status || 'investigating'}, ${data.severity || 'minor'},
        ${JSON.stringify(data.affected_monitors || [])},
        ${data.notify_subscribers || false}, ${data.user_id},
        NOW(), NOW()
      ) RETURNING id
    `; // TODO-LINT: move to async function
    
    const incident = await prisma.$queryRaw`
      SELECT * FROM nova_incidents WHERE id = ${(result as any)[0].id}
    `; // TODO-LINT: move to async function
    
    return (incident as any)[0];
  } catch (error) {
    console.error('Database error creating incident:', error);
    throw new Error('Failed to create incident');
  }
};

export const _getIncidents = async (userId: string) => {
  try {
    const incidents = await prisma.$queryRaw`
      SELECT * FROM nova_incidents 
      WHERE tenant_id = ${userId} 
      ORDER BY created_at DESC
    `; // TODO-LINT: move to async function

    return incidents;
  } catch (error) {
    console.error('Database error fetching incidents:', error);
    throw new Error('Failed to fetch incidents');
  }
};

export const getIncidentById = async (id: string, userId: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM nova_incidents 
      WHERE id = ${id} AND tenant_id = ${userId}
    `; // TODO-LINT: move to async function

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching incident:', error);
    throw new Error('Failed to fetch incident');
  }
};

export const _updateIncident = async (id: string, data: UpdateIncidentData, userId: string) => {
  try {
    const fields: string[] = [];
    const values: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] = [];
    
    if (data.title !== undefined) { fields.push('title = $' + (fields.length + 1)); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = $' + (fields.length + 1)); values.push(data.description); }
    if (data.status !== undefined) { fields.push('status = $' + (fields.length + 1)); values.push(data.status); }
    if (data.severity !== undefined) { fields.push('severity = $' + (fields.length + 1)); values.push(data.severity); }
    if (data.affected_monitors !== undefined) { 
      fields.push('affected_monitors = $' + (fields.length + 1)); 
      values.push(JSON.stringify(data.affected_monitors)); 
    }
    
    if (fields.length === 0) {
      return await getIncidentById(id, userId); // TODO-LINT: move to async function
    }
    
    fields.push('updated_at = NOW()');
    values.push(id, userId);
    
    const query = `
      UPDATE nova_incidents 
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
    `;
    
    await prisma.$executeRawUnsafe(query, ...values); // TODO-LINT: move to async function
    return await getIncidentById(id, userId); // TODO-LINT: move to async function
  } catch (error) {
    console.error('Database error updating incident:', error);
    throw new Error('Failed to update incident');
  }
};

export const _resolveIncident = async (id: string, userId: string) => {
  try {
    await prisma.$executeRaw`
      UPDATE nova_incidents 
      SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${userId}
    `; // TODO-LINT: move to async function

    return await getIncidentById(id, userId); // TODO-LINT: move to async function
  } catch (error) {
    console.error('Database error resolving incident:', error);
    throw new Error('Failed to resolve incident');
  }
};
