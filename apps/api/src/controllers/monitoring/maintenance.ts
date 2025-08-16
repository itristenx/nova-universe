import { PrismaClient } from '../../../../prisma/generated/core/index.js';
const prisma = new PrismaClient({ datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } } });

export interface MaintenanceWindowData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  affected_monitors?: string[];
  notify_affected_monitors?: boolean;
  recurring?: boolean;
  recurring_interval?: string;
  user_id: string;
}

export interface UpdateMaintenanceWindowData extends Partial<MaintenanceWindowData> {}

export const _createMaintenanceWindow = async (data: MaintenanceWindowData) => {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO nova_maintenance_windows (
        title, description, start_time, end_time, recurring, 
        recurring_pattern, notification_sent, tenant_id, 
        created_at, updated_at
      ) VALUES (
        ${data.title}, ${data.description || ''}, 
        ${new Date(data.start_time)}, ${new Date(data.end_time)},
        ${data.recurring || false}, 
        ${JSON.stringify({ interval: data.recurring_interval || 'none' })},
        ${false}, ${data.user_id}, NOW(), NOW()
      ) RETURNING id
    `; // TODO-LINT: move to async function
    
    const maintenance = await prisma.$queryRaw`
      SELECT * FROM nova_maintenance_windows WHERE id = ${(result as any)[0].id}
    `; // TODO-LINT: move to async function
    
    return (maintenance as any)[0];
  } catch (error) {
    console.error('Database error creating maintenance window:', error);
    throw new Error('Failed to create maintenance window');
  }
};

export const _getMaintenanceWindows = async (userId: string) => {
  try {
    const maintenance = await prisma.$queryRaw`
      SELECT * FROM nova_maintenance_windows 
      WHERE tenant_id = ${userId} 
      ORDER BY start_time DESC
    `; // TODO-LINT: move to async function

    return maintenance;
  } catch (error) {
    console.error('Database error fetching maintenance windows:', error);
    throw new Error('Failed to fetch maintenance windows');
  }
};

export const _updateMaintenanceWindow = async (id: string, data: UpdateMaintenanceWindowData, userId: string) => {
  try {
    const fields: string[] = [];
    const values: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] = [];
    
    if (data.title !== undefined) { fields.push('title = $' + (fields.length + 1)); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = $' + (fields.length + 1)); values.push(data.description); }
    if (data.start_time !== undefined) { fields.push('start_time = $' + (fields.length + 1)); values.push(new Date(data.start_time)); }
    if (data.end_time !== undefined) { fields.push('end_time = $' + (fields.length + 1)); values.push(new Date(data.end_time)); }
    if (data.recurring !== undefined) { fields.push('recurring = $' + (fields.length + 1)); values.push(data.recurring); }
    
    if (fields.length === 0) {
      return await getMaintenanceWindowById(id, userId); // TODO-LINT: move to async function
    }
    
    fields.push('updated_at = NOW()');
    values.push(id, userId);
    
    const query = `
      UPDATE nova_maintenance_windows 
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
    `;
    
    await prisma.$executeRawUnsafe(query, ...values); // TODO-LINT: move to async function
    return await getMaintenanceWindowById(id, userId); // TODO-LINT: move to async function
  } catch (error) {
    console.error('Database error updating maintenance window:', error);
    throw new Error('Failed to update maintenance window');
  }
};

export const getMaintenanceWindowById = async (id: string, userId: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM nova_maintenance_windows 
      WHERE id = ${id} AND tenant_id = ${userId}
    `; // TODO-LINT: move to async function

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching maintenance window:', error);
    throw new Error('Failed to fetch maintenance window');
  }
};

export const _deleteMaintenanceWindow = async (id: string, userId: string) => {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM nova_maintenance_windows 
      WHERE id = ${id} AND tenant_id = ${userId}
    `; // TODO-LINT: move to async function

    return result > 0;
  } catch (error) {
    console.error('Database error deleting maintenance window:', error);
    throw new Error('Failed to delete maintenance window');
  }
};
