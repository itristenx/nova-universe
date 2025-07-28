import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { gql } from 'graphql-tag';
import db from './db.js';

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
  app.use('/api/v2/graphql', expressMiddleware(server));
}
