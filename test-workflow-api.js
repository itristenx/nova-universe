#!/usr/bin/env node

// Simple test server for workflow and approval APIs
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock authentication middleware
const authenticateJWT = (req, res, next) => {
  req.user = { id: 'admin', name: 'Admin User' };
  next();
};

const checkPermission = (permission) => (req, res, next) => {
  // Mock permission check - always allow for testing
  next();
};

// Import our workflow routes
import workflowRoutes from '../apps/api/routes/workflows.js';
import approvalRoutes from '../apps/api/routes/approvals.js';

// Use routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/approvals', approvalRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Workflow and Approval API server running' });
});

app.listen(port, () => {
  console.log(`🚀 Test API server running on http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /health - Health check`);
  console.log(`  GET /api/workflows - List workflows`);
  console.log(`  GET /api/workflows/templates - List workflow templates`);
  console.log(`  POST /api/workflows - Create workflow`);
  console.log(`  GET /api/approvals/workflows - List approval flows`);
  console.log(`  GET /api/approvals/instances - List approval instances`);
});