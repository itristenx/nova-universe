import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { gql } from 'graphql-tag';
import db from './db.js';
import { verify } from './jwt.js';

const typeDefs = gql`
  type Ticket {
    id: ID!
    title: String
    status: String
    priority: String
    assignedTo: String
  }

  type Query {
    tickets(status: String): [Ticket]
  }
`;

const resolvers = {
  Query: {
    tickets: async (_, { status }) => {
      let sql = 'SELECT id, title, status, priority, assigned_to_id FROM tickets WHERE deleted_at IS NULL';
      const params = [];
      if (status) {
        sql += ' AND status = $1';
        params.push(status);
      }
      const result = await db.query(sql, params);
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to_id || null
      }));
    }
  }
};

export async function setupGraphQL(app) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.replace(/^Bearer\s+/i, '');
    const payload = token && verify(token);
    if (!payload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const userQuery = `
        SELECT u.id, u.name, u.email, r.name AS role
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.userId
        LEFT JOIN roles r ON ur.roleId = r.id
        WHERE u.id = $1
      `;
      const result = await db.query(userQuery, [payload.id]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const user = {
        id: payload.id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        roles: Array.from(new Set(result.rows.map((r) => r.role).filter(Boolean)))
      };
      if (!user.roles.includes('admin') && !user.roles.includes('superadmin')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  };

  app.use(
    '/api/v2/graphql',
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => ({ user: req.user })
    })
  );
}
