import { PrismaClient } from '../../../../prisma/generated/core/index.js';
const prisma = new PrismaClient({
  datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } },
});

export interface TagData {
  name: string;
  color?: string;
  user_id: string;
}

export interface UpdateTagData extends Partial<TagData> {}

export const createTag = async (data: TagData) => {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO nova_tags (
        name, color, tenant_id, created_at, updated_at
      ) VALUES (
        ${data.name}, ${data.color || '#007AFF'}, 
        ${data.user_id}, NOW(), NOW()
      ) RETURNING id
    `;

    const tag = await prisma.$queryRaw`
      SELECT * FROM nova_tags WHERE id = ${(result as any)[0].id}
    `;

    return (tag as any)[0];
  } catch (error) {
    console.error('Database error creating tag:', error);
    throw new Error('Failed to create tag');
  }
};

export const getTags = async (userId: string) => {
  try {
    const tags = await prisma.$queryRaw`
      SELECT * FROM nova_tags 
      WHERE tenant_id = ${userId} OR tenant_id IS NULL
      ORDER BY name
    `;

    return tags;
  } catch (error) {
    console.error('Database error fetching tags:', error);
    throw new Error('Failed to fetch tags');
  }
};

export const updateTag = async (id: string, data: UpdateTagData, userId: string) => {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = $' + (fields.length + 1));
      values.push(data.name);
    }
    if (data.color !== undefined) {
      fields.push('color = $' + (fields.length + 1));
      values.push(data.color);
    }

    if (fields.length === 0) {
      return await getTagById(id, userId);
    }

    fields.push('updated_at = NOW()');
    values.push(id, userId);

    const query = `
      UPDATE nova_tags 
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND tenant_id = $${values.length}
    `;

    await prisma.$executeRawUnsafe(query, ...values);
    return await getTagById(id, userId);
  } catch (error) {
    console.error('Database error updating tag:', error);
    throw new Error('Failed to update tag');
  }
};

export const getTagById = async (id: string, userId: string) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM nova_tags 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return (result as any)[0] || null;
  } catch (error) {
    console.error('Database error fetching tag:', error);
    throw new Error('Failed to fetch tag');
  }
};

export const deleteTag = async (id: string, userId: string) => {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM nova_tags 
      WHERE id = ${id} AND tenant_id = ${userId}
    `;

    return result > 0;
  } catch (error) {
    console.error('Database error deleting tag:', error);
    throw new Error('Failed to delete tag');
  }
};
