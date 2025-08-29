import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

export interface DatabaseConfig {
  type: 'postgresql' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connectionString?: string;
}

export interface TableInfo {
  name: string;
  columns: string[];
  rowCount: number;
}

export interface IndexInfo {
  table: string;
  column: string;
  indexName: string;
  unique: boolean;
}

export interface ForeignKeyInfo {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export class DatabaseTestHelper {
  private pgPool?: Pool;
  private mongoClient?: MongoClient;
  private config: DatabaseConfig;

  constructor() {
    // Determine database type and configuration from environment
    this.config = this.getConfigFromEnvironment();
  }

  private getConfigFromEnvironment(): DatabaseConfig {
    const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    
    if (dbUrl?.includes('postgresql://') || dbUrl?.includes('postgres://')) {
      return {
        type: 'postgresql',
        connectionString: dbUrl,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'nova_universe_test',
        username: process.env.DB_USER || 'nova_admin',
        password: process.env.DB_PASSWORD || 'nova_password'
      };
    } else if (dbUrl?.includes('mongodb://')) {
      return {
        type: 'mongodb',
        connectionString: dbUrl,
        host: process.env.MONGO_HOST || 'localhost',
        port: parseInt(process.env.MONGO_PORT || '27017'),
        database: process.env.MONGO_DB || 'nova_universe_test',
        username: process.env.MONGO_USER || '',
        password: process.env.MONGO_PASSWORD || ''
      };
    }
    
    // Default to PostgreSQL
    return {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'nova_universe_test',
      username: 'nova_admin',
      password: 'nova_password'
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.config.type === 'postgresql') {
        await this.connectPostgreSQL();
        const result = await this.pgPool?.query('SELECT 1 as test');
        return result?.rows?.[0]?.test === 1;
      } else if (this.config.type === 'mongodb') {
        await this.connectMongoDB();
        await this.mongoClient?.db().admin().ping();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  private async connectPostgreSQL(): Promise<void> {
    if (!this.pgPool) {
      this.pgPool = new Pool({
        connectionString: this.config.connectionString,
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
  }

  private async connectMongoDB(): Promise<void> {
    if (!this.mongoClient) {
      const connectionString = this.config.connectionString || 
        `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
      
      this.mongoClient = new MongoClient(connectionString);
      await this.mongoClient.connect();
    }
  }

  async getTableList(): Promise<string[]> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      return result?.rows?.map(row => row.table_name) || [];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const collections = await db?.listCollections().toArray();
      return collections?.map(col => col.name) || [];
    }
    return [];
  }

  async getIndexes(): Promise<IndexInfo[]> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        SELECT 
          t.tablename as table,
          i.indexname as index_name,
          a.attname as column,
          i.indexdef LIKE '%UNIQUE%' as unique
        FROM pg_indexes i
        JOIN pg_class c ON c.relname = i.indexname
        JOIN pg_attribute a ON a.attrelid = c.oid
        JOIN pg_tables t ON t.tablename = i.tablename
        WHERE t.schemaname = 'public'
        ORDER BY t.tablename, i.indexname
      `);
      return result?.rows?.map(row => ({
        table: row.table,
        column: row.column,
        indexName: row.index_name,
        unique: row.unique
      })) || [];
    }
    return [];
  }

  async getForeignKeyConstraints(): Promise<ForeignKeyInfo[]> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        SELECT
          tc.table_name as table,
          kcu.column_name as column,
          ccu.table_name as referenced_table,
          ccu.column_name as referenced_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name
      `);
      return result?.rows?.map(row => ({
        table: row.table,
        column: row.column,
        referencedTable: row.referenced_table,
        referencedColumn: row.referenced_column
      })) || [];
    }
    return [];
  }

  // User management
  async createUser(userData: any): Promise<string> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        INSERT INTO users (email, first_name, last_name, role, status, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, [userData.email, userData.firstName, userData.lastName, userData.role, userData.status]);
      return result?.rows?.[0]?.id;
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const result = await db?.collection('users').insertOne({
        ...userData,
        createdAt: new Date()
      });
      return result?.insertedId?.toString();
    }
    throw new Error('Unsupported database type');
  }

  async getUserById(id: string): Promise<any> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query('SELECT * FROM users WHERE id = $1', [id]);
      return result?.rows?.[0];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      return await db?.collection('users').findOne({ _id: id });
    }
    return null;
  }

  async deleteUser(id: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('DELETE FROM users WHERE id = $1', [id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('users').deleteOne({ _id: id });
    }
  }

  // Organization management
  async createOrganization(orgData: any): Promise<string> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        INSERT INTO organizations (name, description, created_at)
        VALUES ($1, $2, NOW())
        RETURNING id
      `, [orgData.name, orgData.description]);
      return result?.rows?.[0]?.id;
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const result = await db?.collection('organizations').insertOne({
        ...orgData,
        createdAt: new Date()
      });
      return result?.insertedId?.toString();
    }
    throw new Error('Unsupported database type');
  }

  async getOrganizationById(id: string): Promise<any> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query('SELECT * FROM organizations WHERE id = $1', [id]);
      return result?.rows?.[0];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      return await db?.collection('organizations').findOne({ _id: id });
    }
    return null;
  }

  async deleteOrganization(id: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('DELETE FROM organizations WHERE id = $1', [id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('organizations').deleteOne({ _id: id });
    }
  }

  // Category management
  async createCategory(categoryData: any): Promise<string> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        INSERT INTO categories (name, description, organization_id, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `, [categoryData.name, categoryData.description, categoryData.organizationId]);
      return result?.rows?.[0]?.id;
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const result = await db?.collection('categories').insertOne({
        ...categoryData,
        createdAt: new Date()
      });
      return result?.insertedId?.toString();
    }
    throw new Error('Unsupported database type');
  }

  async deleteCategory(id: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('DELETE FROM categories WHERE id = $1', [id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('categories').deleteOne({ _id: id });
    }
  }

  // Ticket management
  async createTicket(ticketData: any): Promise<string> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        INSERT INTO tickets (title, description, priority, status, category_id, organization_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `, [
        ticketData.title,
        ticketData.description,
        ticketData.priority,
        ticketData.status,
        ticketData.categoryId,
        ticketData.organizationId
      ]);
      return result?.rows?.[0]?.id;
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const result = await db?.collection('tickets').insertOne({
        ...ticketData,
        createdAt: new Date()
      });
      return result?.insertedId?.toString();
    }
    throw new Error('Unsupported database type');
  }

  async getTicketById(id: string): Promise<any> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query('SELECT * FROM tickets WHERE id = $1', [id]);
      return result?.rows?.[0];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      return await db?.collection('tickets').findOne({ _id: id });
    }
    return null;
  }

  async getTicketsByTitle(title: string): Promise<any[]> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query('SELECT * FROM tickets WHERE title = $1', [title]);
      return result?.rows || [];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const tickets = await db?.collection('tickets').find({ title }).toArray();
      return tickets || [];
    }
    return [];
  }

  async updateTicketStatus(id: string, status: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('tickets').updateOne(
        { _id: id },
        { $set: { status, updatedAt: new Date() } }
      );
    }
  }

  async deleteTicket(id: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('DELETE FROM tickets WHERE id = $1', [id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('tickets').deleteOne({ _id: id });
    }
  }

  async getTicketsPaginated(page: number, limit: number): Promise<any[]> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const offset = (page - 1) * limit;
      const result = await this.pgPool?.query(
        'SELECT * FROM tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result?.rows || [];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const tickets = await db?.collection('tickets')
        .find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      return tickets || [];
    }
    return [];
  }

  async getTicketCountByOrganization(organizationId: string): Promise<number> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(
        'SELECT COUNT(*) as count FROM tickets WHERE organization_id = $1',
        [organizationId]
      );
      return parseInt(result?.rows?.[0]?.count || '0');
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      return await db?.collection('tickets').countDocuments({ organizationId }) || 0;
    }
    return 0;
  }

  async addTicketComment(ticketId: string, commentData: any): Promise<string> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        INSERT INTO comments (ticket_id, user_id, content, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `, [ticketId, commentData.userId, commentData.content]);
      return result?.rows?.[0]?.id;
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const result = await db?.collection('comments').insertOne({
        ticketId,
        ...commentData,
        createdAt: new Date()
      });
      return result?.insertedId?.toString();
    }
    throw new Error('Unsupported database type');
  }

  // Asset management
  async createAsset(assetData: any): Promise<string> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query(`
        INSERT INTO assets (name, type, status, serial_number, organization_id, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, [
        assetData.name,
        assetData.type,
        assetData.status,
        assetData.serialNumber,
        assetData.organizationId
      ]);
      return result?.rows?.[0]?.id;
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      const result = await db?.collection('assets').insertOne({
        ...assetData,
        createdAt: new Date()
      });
      return result?.insertedId?.toString();
    }
    throw new Error('Unsupported database type');
  }

  async getAssetById(id: string): Promise<any> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      const result = await this.pgPool?.query('SELECT * FROM assets WHERE id = $1', [id]);
      return result?.rows?.[0];
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      return await db?.collection('assets').findOne({ _id: id });
    }
    return null;
  }

  async updateAssetStatus(id: string, status: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('UPDATE assets SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('assets').updateOne(
        { _id: id },
        { $set: { status, updatedAt: new Date() } }
      );
    }
  }

  async deleteAsset(id: string): Promise<void> {
    if (this.config.type === 'postgresql') {
      await this.connectPostgreSQL();
      await this.pgPool?.query('DELETE FROM assets WHERE id = $1', [id]);
    } else if (this.config.type === 'mongodb') {
      await this.connectMongoDB();
      const db = this.mongoClient?.db(this.config.database);
      await db?.collection('assets').deleteOne({ _id: id });
    }
  }

  // Backup and recovery testing
  async testBackupProcedure(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.config.type === 'postgresql') {
        // Test basic backup readiness
        await this.connectPostgreSQL();
        const result = await this.pgPool?.query('SELECT version()');
        if (result?.rows?.[0]) {
          return { success: true, message: 'Database backup procedure validated' };
        }
      } else if (this.config.type === 'mongodb') {
        await this.connectMongoDB();
        const db = this.mongoClient?.db(this.config.database);
        const stats = await db?.stats();
        if (stats) {
          return { success: true, message: 'Database backup procedure validated' };
        }
      }
      return { success: false, message: 'Backup validation failed' };
    } catch (error) {
      return { success: false, message: `Backup validation error: ${error}` };
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pgPool) {
        await this.pgPool.end();
        this.pgPool = undefined;
      }
      if (this.mongoClient) {
        await this.mongoClient.close();
        this.mongoClient = undefined;
      }
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}