import { PrismaClient } from '../../../../prisma/generated/core/index.js';
const prisma = new PrismaClient({
  datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } },
});

export interface MonitorData {
  name: string;
  type: string;
  url?: string;
  method?: string;
  interval?: number;
  timeout?: number;
  max_redirects?: number;
  accepted_status_codes?: number[];
  headers?: Record<string, string>;
  body?: string;
  keyword?: string;
  invert_keyword?: boolean;
  ignore_tls?: boolean;
  auth_method?: string;
  auth_username?: string;
  auth_password?: string;
  tag_names?: string[];
  notification_providers?: string[];
  resend_interval?: number;
  max_retries?: number;
  retry_interval?: number;
  upside_down?: boolean;
  push_token?: string;
  expiry_notification?: boolean;
  port?: number;
  hostname?: string;
  record_type?: string;
  expected_value?: string;
  docker_container?: string;
  docker_host?: string;
  mqtt_topic?: string;
  mqtt_username?: string;
  mqtt_password?: string;
  database_connection_string?: string;
  sql_query?: string;
  radius_username?: string;
  radius_password?: string;
  radius_calling_station_id?: string;
  game_server_id?: string;
  user_id: string;
}

export interface UpdateMonitorData extends Partial<MonitorData> {}

export const createMonitor = async (data: MonitorData) => {
  try {
    // Use direct SQL query since the table is nova_monitors, not in Prisma schema yet
    const result = await prisma.$queryRaw`
      INSERT INTO nova_monitors (
        name, type, url, method, interval_seconds, timeout_seconds, 
        max_redirects, accepted_status_codes, headers, body, keyword,
        keyword_inverted, ignore_tls, auth_method, auth_username, auth_password,
        push_token, expiry_notification, port, hostname, docker_container,
        docker_host, description, weight, upside_down, tenant_id, status,
        created_at, updated_at
      ) VALUES (
        ${data.name}, ${data.type}, ${data.url || null}, ${data.method || 'GET'},
        ${data.interval || 60}, ${data.timeout || 30}, ${data.max_redirects || 10},
        ${JSON.stringify(data.accepted_status_codes || [200])}, 
        ${JSON.stringify(data.headers || {})}, ${data.body || null},
        ${data.keyword || null}, ${data.invert_keyword || false},
        ${data.ignore_tls || false}, ${data.auth_method || 'none'},
        ${data.auth_username || null}, ${data.auth_password || null},
        ${data.push_token || null}, ${data.expiry_notification || false},
        ${data.port || null}, ${data.hostname || null}, 
        ${data.docker_container || null}, ${data.docker_host || null},
        ${null}, ${1000}, ${data.upside_down || false}, 
        ${data.user_id}, ${'active'}, NOW(), NOW()
      ) RETURNING id
    `;

    const monitor = await prisma.$queryRaw`
      SELECT * FROM nova_monitors WHERE id = ${(result as any)[0].id}
    `;

    return (monitor as any)[0];
  } catch (error) {
    console.error('Database error creating monitor:', error);
    throw new Error('Failed to create monitor');
  }
};

export const getMonitors = async (userId: string) => {
  try {
    const monitors = await prisma.$queryRaw`
      SELECT * FROM nova_monitors 
      WHERE tenant_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return monitors;
  } catch (error) {
    console.error('Database error fetching monitors:', error);
    throw new Error('Failed to fetch monitors');
  }
};

export const getMonitorById = async (id: string, userId: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM nova_monitors 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching monitor:', error);
    throw new Error('Failed to fetch monitor');
  }
};

export const updateMonitor = async (id: string, data: UpdateMonitorData, userId: string) => {
  try {
    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = $' + (fields.length + 1));
      values.push(data.name);
    }
    if (data.type !== undefined) {
      fields.push('type = $' + (fields.length + 1));
      values.push(data.type);
    }
    if (data.url !== undefined) {
      fields.push('url = $' + (fields.length + 1));
      values.push(data.url);
    }
    if (data.interval !== undefined) {
      fields.push('interval_seconds = $' + (fields.length + 1));
      values.push(data.interval);
    }
    if (data.timeout !== undefined) {
      fields.push('timeout_seconds = $' + (fields.length + 1));
      values.push(data.timeout);
    }

    if (fields.length === 0) {
      return await getMonitorById(id, userId);
    }

    fields.push('updated_at = NOW()');
    values.push(id, userId);

    const query = `
      UPDATE nova_monitors 
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
    `;

    await prisma.$executeRawUnsafe(query, ...values);
    return await getMonitorById(id, userId);
  } catch (error) {
    console.error('Database error updating monitor:', error);
    throw new Error('Failed to update monitor');
  }
};

export const deleteMonitor = async (id: string, userId: string) => {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM nova_monitors 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return result > 0;
  } catch (error) {
    console.error('Database error deleting monitor:', error);
    throw new Error('Failed to delete monitor');
  }
};

export const updateMonitorStatus = async (id: string, status: boolean, userId: string) => {
  try {
    await prisma.$executeRaw`
      UPDATE nova_monitors 
      SET status = ${status ? 'up' : 'down'}, updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return await getMonitorById(id, userId);
  } catch (error) {
    console.error('Database error updating monitor status:', error);
    throw new Error('Failed to update monitor status');
  }
};
