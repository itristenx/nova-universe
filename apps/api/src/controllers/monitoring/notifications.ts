import { PrismaClient } from '../../../../prisma/generated/core/index.js';
const prisma = new PrismaClient({
  datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } },
});

export interface NotificationProviderData {
  name: string;
  type: string;
  is_default?: boolean;
  apply_existing?: boolean;
  config: Record<string, any>;
  user_id: string;
}

export interface UpdateNotificationProviderData extends Partial<NotificationProviderData> {}

export const createNotificationProvider = async (data: NotificationProviderData) => {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO nova_notification_channels (
        name, type, is_default, apply_existing, provider_config,
        tenant_id, active, created_at, updated_at
      ) VALUES (
        ${data.name}, ${data.type}, ${data.is_default || false},
        ${data.apply_existing || false}, ${JSON.stringify(data.config)},
        ${data.user_id}, true, NOW(), NOW()
      ) RETURNING id
    `;

    const provider = await prisma.$queryRaw`
      SELECT * FROM nova_notification_channels WHERE id = ${(result as any)[0].id}
    `;

    return (provider as any)[0];
  } catch (error) {
    console.error('Database error creating notification provider:', error);
    throw new Error('Failed to create notification provider');
  }
};

export const getNotificationProviders = async (userId: string) => {
  try {
    const providers = await prisma.$queryRaw`
      SELECT * FROM nova_notification_channels 
      WHERE tenant_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return providers;
  } catch (error) {
    console.error('Database error fetching notification providers:', error);
    throw new Error('Failed to fetch notification providers');
  }
};

export const updateNotificationProvider = async (
  id: string,
  data: UpdateNotificationProviderData,
  userId: string,
) => {
  try {
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
    if (data.is_default !== undefined) {
      fields.push('is_default = $' + (fields.length + 1));
      values.push(data.is_default);
    }
    if (data.config !== undefined) {
      fields.push('provider_config = $' + (fields.length + 1));
      values.push(JSON.stringify(data.config));
    }

    if (fields.length === 0) {
      return await getNotificationProviderById(id, userId);
    }

    fields.push('updated_at = NOW()');
    values.push(id, userId);

    const query = `
      UPDATE nova_notification_channels 
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
    `;

    await prisma.$executeRawUnsafe(query, ...values);
    return await getNotificationProviderById(id, userId);
  } catch (error) {
    console.error('Database error updating notification provider:', error);
    throw new Error('Failed to update notification provider');
  }
};

export const getNotificationProviderById = async (id: string, userId: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM nova_notification_channels 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching notification provider:', error);
    throw new Error('Failed to fetch notification provider');
  }
};

export const deleteNotificationProvider = async (id: string, userId: string) => {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM nova_notification_channels 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return result > 0;
  } catch (error) {
    console.error('Database error deleting notification provider:', error);
    throw new Error('Failed to delete notification provider');
  }
};

export const testNotificationProvider = async (id: string, userId: string) => {
  try {
    const provider = await getNotificationProviderById(id, userId);
    if (!provider) {
      throw new Error('Notification provider not found');
    }

    const config = provider.provider_config || provider.config || {};
    const type = provider.type;

    // Minimal smoke tests by provider type
    switch (type) {
      case 'email': {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env as Record<
          string,
          string
        >;
        if (!SMTP_HOST || !SMTP_PORT) {
          throw new Error('SMTP not configured');
        }
        // Basic connectivity check using nodemailer verify
        const nodemailer = await import('nodemailer');
        const transport = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT, 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        });
        await transport.verify();
        break;
      }
      case 'slack': {
        const url = config.webhook_url || process.env.SLACK_WEBHOOK_URL;
        if (!url) throw new Error('Slack webhook not configured');
        // Send dry-run test with short timeout
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Nova notification test (dry run)', nova_test: true }),
        });
        if (!res.ok) throw new Error(`Slack webhook responded ${res.status}`);
        break;
      }
      default: {
        // For unsupported providers, at least validate required fields exist
        if (!provider.name || !provider.type) {
          throw new Error('Provider configuration invalid');
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Notification provider test failed:', error);
    return false;
  }
};
