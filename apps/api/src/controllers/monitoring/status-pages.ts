import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StatusPageData {
  name: string;
  slug: string;
  description?: string;
  is_public?: boolean;
  theme?: string;
  incident_history_days?: number;
  custom_domain?: string;
  monitors?: string[];
  groups?: Array<{ name: string; monitors: string[] }>;
  user_id: string;
}

export interface UpdateStatusPageData extends Partial<StatusPageData> {}

export const createStatusPage = async (data: StatusPageData) => {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO nova_status_pages (
        title, slug, description, published, theme, incident_history_days,
        domain_name, tenant_id, created_at, updated_at
      ) VALUES (
        ${data.name}, ${data.slug}, ${data.description || ''},
        ${data.is_public !== false}, ${data.theme || 'light'},
        ${data.incident_history_days || 90}, ${data.custom_domain || null},
        ${data.user_id}, NOW(), NOW()
      ) RETURNING id
    `;
    
    const statusPage = await prisma.$queryRaw`
      SELECT * FROM nova_status_pages WHERE id = ${(result as any)[0].id}
    `;
    
    return (statusPage as any)[0];
  } catch (error) {
    console.error('Database error creating status page:', error);
    throw new Error('Failed to create status page');
  }
};

export const getStatusPages = async (userId: string) => {
  try {
    const statusPages = await prisma.$queryRaw`
      SELECT * FROM nova_status_pages 
      WHERE tenant_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return statusPages;
  } catch (error) {
    console.error('Database error fetching status pages:', error);
    throw new Error('Failed to fetch status pages');
  }
};

export const getStatusPageBySlug = async (slug: string, userId?: string) => {
  try {
    const whereClause = userId 
      ? `WHERE slug = ${slug} AND tenant_id = ${userId}`
      : `WHERE slug = ${slug} AND published = true`;
      
    const result = await prisma.$queryRawUnsafe(`
      SELECT * FROM nova_status_pages ${whereClause}
    `);

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching status page by slug:', error);
    throw new Error('Failed to fetch status page');
  }
};

export const getPublicStatusPage = async (slug: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT sp.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', m.id,
                   'name', m.name,
                   'status', m.status,
                   'type', m.type
                 )
               ) FILTER (WHERE m.id IS NOT NULL), 
               '[]'::json
             ) as monitors
      FROM nova_status_pages sp
      LEFT JOIN nova_status_page_monitors spm ON sp.id = spm.status_page_id
      LEFT JOIN nova_monitors m ON spm.monitor_id = m.id
      WHERE sp.slug = ${slug} AND sp.published = true
      GROUP BY sp.id
    `;

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching public status page:', error);
    throw new Error('Failed to fetch public status page');
  }
};

export const updateStatusPage = async (id: string, data: UpdateStatusPageData, userId: string) => {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) { fields.push('title = $' + (fields.length + 1)); values.push(data.name); }
    if (data.slug !== undefined) { fields.push('slug = $' + (fields.length + 1)); values.push(data.slug); }
    if (data.description !== undefined) { fields.push('description = $' + (fields.length + 1)); values.push(data.description); }
    if (data.theme !== undefined) { fields.push('theme = $' + (fields.length + 1)); values.push(data.theme); }
    if (data.is_public !== undefined) { fields.push('published = $' + (fields.length + 1)); values.push(data.is_public); }
    
    if (fields.length === 0) {
      return await getStatusPageById(id, userId);
    }
    
    fields.push('updated_at = NOW()');
    values.push(id, userId);
    
    const query = `
      UPDATE nova_status_pages 
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
    `;
    
    await prisma.$executeRawUnsafe(query, ...values);
    return await getStatusPageById(id, userId);
  } catch (error) {
    console.error('Database error updating status page:', error);
    throw new Error('Failed to update status page');
  }
};

export const getStatusPageById = async (id: string, userId: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM nova_status_pages 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching status page:', error);
    throw new Error('Failed to fetch status page');
  }
};

export const deleteStatusPage = async (id: string, userId: string) => {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM nova_status_pages 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return result > 0;
  } catch (error) {
    console.error('Database error deleting status page:', error);
    throw new Error('Failed to delete status page');
  }
};
