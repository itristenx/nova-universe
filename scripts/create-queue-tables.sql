-- Create missing queue management tables
-- These should have been created by Prisma migrations but weren't

-- Create Queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Queue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "maxAgents" INTEGER,
    "autoAssign" BOOLEAN NOT NULL DEFAULT true,
    "workingHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- Create unique index for queue name
CREATE UNIQUE INDEX IF NOT EXISTS "Queue_name_key" ON "Queue"("name");

-- Create QueueAccess table if it doesn't exist
CREATE TABLE IF NOT EXISTS "QueueAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL DEFAULT 'agent',
    "canViewReports" BOOLEAN NOT NULL DEFAULT false,
    "canManageQueue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueAccess_pkey" PRIMARY KEY ("id")
);

-- Create unique index for user-queue combination
CREATE UNIQUE INDEX IF NOT EXISTS "QueueAccess_userId_queueName_key" ON "QueueAccess"("userId", "queueName");

-- Create AgentAvailability table if it doesn't exist  
CREATE TABLE IF NOT EXISTS "AgentAvailability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'available',
    "maxCapacity" INTEGER NOT NULL DEFAULT 5,
    "currentLoad" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentAvailability_pkey" PRIMARY KEY ("id")
);

-- Create unique index for user-queue combination in availability
CREATE UNIQUE INDEX IF NOT EXISTS "AgentAvailability_userId_queueName_key" ON "AgentAvailability"("userId", "queueName");

-- Create QueueMetrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS "QueueMetrics" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "totalAgents" INTEGER NOT NULL DEFAULT 0,
    "availableAgents" INTEGER NOT NULL DEFAULT 0,
    "busyAgents" INTEGER NOT NULL DEFAULT 0,
    "pendingTickets" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION,
    "capacityUtilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "alertLevel" TEXT NOT NULL DEFAULT 'normal',
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueMetrics_pkey" PRIMARY KEY ("id")
);

-- Create unique index for queue metrics
CREATE UNIQUE INDEX IF NOT EXISTS "QueueMetrics_queueName_key" ON "QueueMetrics"("queueName");

-- Create QueueAlert table if it doesn't exist
CREATE TABLE IF NOT EXISTS "QueueAlert" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "message" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueAlert_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "QueueAccess" 
ADD CONSTRAINT IF NOT EXISTS "QueueAccess_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QueueAccess" 
ADD CONSTRAINT IF NOT EXISTS "QueueAccess_queueName_fkey" 
FOREIGN KEY ("queueName") REFERENCES "Queue"("name") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentAvailability" 
ADD CONSTRAINT IF NOT EXISTS "AgentAvailability_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentAvailability" 
ADD CONSTRAINT IF NOT EXISTS "AgentAvailability_queueName_fkey" 
FOREIGN KEY ("queueName") REFERENCES "Queue"("name") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QueueMetrics" 
ADD CONSTRAINT IF NOT EXISTS "QueueMetrics_queueName_fkey" 
FOREIGN KEY ("queueName") REFERENCES "Queue"("name") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QueueAlert" 
ADD CONSTRAINT IF NOT EXISTS "QueueAlert_queueName_fkey" 
FOREIGN KEY ("queueName") REFERENCES "Queue"("name") ON DELETE CASCADE ON UPDATE CASCADE;
