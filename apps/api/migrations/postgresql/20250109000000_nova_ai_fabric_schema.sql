-- Nova AI Fabric Database Schema Migration
-- Version: 20250109000000
-- Description: Complete AI Fabric schema for Nova Universe

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "vector" IF EXISTS;

-- ========================================
-- AI FABRIC CORE TABLES
-- ========================================

-- AI Providers table
CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('external', 'internal', 'mcp', 'rag', 'custom')),
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    health_status VARCHAR(20) NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy')),
    last_health_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Requests table
CREATE TABLE IF NOT EXISTS ai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(255) UNIQUE NOT NULL,
    provider_id VARCHAR(255) REFERENCES ai_providers(provider_id),
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    input_data JSONB NOT NULL,
    context JSONB DEFAULT '{}',
    model_type VARCHAR(100),
    request_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_ms INTEGER,
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0.00
);

-- AI Responses table
CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(255) REFERENCES ai_requests(request_id),
    response_data JSONB NOT NULL,
    confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
    explanation JSONB,
    alternatives JSONB DEFAULT '[]',
    business_context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    quality_score DECIMAL(5, 4) CHECK (quality_score >= 0 AND quality_score <= 1),
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('positive', 'negative', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- AI MONITORING & METRICS TABLES
-- ========================================

-- AI Metrics table
CREATE TABLE IF NOT EXISTS ai_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id VARCHAR(255) UNIQUE NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(15, 6) NOT NULL,
    unit VARCHAR(50),
    provider_id VARCHAR(255),
    model_id VARCHAR(255),
    user_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Audit Events table
CREATE TABLE IF NOT EXISTS ai_audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    details JSONB NOT NULL DEFAULT '{}',
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    compliance_flags JSONB DEFAULT '[]',
    retention_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bias Detection table
CREATE TABLE IF NOT EXISTS ai_bias_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    protected_attribute VARCHAR(100) NOT NULL,
    bias_type VARCHAR(50) NOT NULL,
    bias_score DECIMAL(5, 4) NOT NULL CHECK (bias_score >= 0 AND bias_score <= 1),
    sample_size INTEGER NOT NULL,
    confidence_interval JSONB,
    mitigation_applied BOOLEAN DEFAULT false,
    mitigation_details JSONB,
    test_data_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Drift Detection table
CREATE TABLE IF NOT EXISTS ai_model_drift (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drift_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    drift_type VARCHAR(50) NOT NULL CHECK (drift_type IN ('data', 'concept', 'prediction')),
    drift_score DECIMAL(5, 4) NOT NULL CHECK (drift_score >= 0 AND drift_score <= 1),
    baseline_period DATERANGE NOT NULL,
    detection_period DATERANGE NOT NULL,
    statistical_test VARCHAR(100),
    p_value DECIMAL(10, 8),
    threshold DECIMAL(5, 4),
    alert_triggered BOOLEAN DEFAULT false,
    remediation_status VARCHAR(20) DEFAULT 'pending' CHECK (remediation_status IN ('pending', 'in_progress', 'completed', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- NOVA LOCAL AI/ML TABLES
-- ========================================

-- Nova Models table
CREATE TABLE IF NOT EXISTS nova_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('classification', 'regression', 'nlp', 'prediction', 'clustering')),
    status VARCHAR(20) NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'ready', 'deploying', 'error', 'archived')),
    accuracy DECIMAL(5, 4) CHECK (accuracy >= 0 AND accuracy <= 1),
    training_data JSONB NOT NULL DEFAULT '{}',
    model_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Training Jobs table
CREATE TABLE IF NOT EXISTS nova_training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(255) REFERENCES nova_models(model_id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    config JSONB NOT NULL DEFAULT '{}',
    progress JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    error_details TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Events table
CREATE TABLE IF NOT EXISTS nova_learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(255) REFERENCES nova_models(model_id),
    event_type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    expected_output JSONB,
    actual_output JSONB,
    feedback VARCHAR(20) CHECK (feedback IN ('correct', 'incorrect', 'partial')),
    confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- OPENAI HARMONY INTEGRATION TABLES
-- ========================================

-- Training Datasets table
CREATE TABLE IF NOT EXISTS harmony_datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dataset_type VARCHAR(50) NOT NULL CHECK (dataset_type IN ('supervised', 'unsupervised', 'reinforcement', 'fine_tuning')),
    format VARCHAR(20) NOT NULL DEFAULT 'jsonl',
    source VARCHAR(50) NOT NULL,
    size_info JSONB NOT NULL DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    privacy_info JSONB NOT NULL DEFAULT '{}',
    file_path TEXT,
    checksum VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Harmony Training Jobs table
CREATE TABLE IF NOT EXISTS harmony_training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    base_model VARCHAR(100) NOT NULL,
    dataset_id VARCHAR(255) REFERENCES harmony_datasets(dataset_id),
    hyperparameters JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    costs JSONB DEFAULT '{}',
    compliance_info JSONB DEFAULT '{}',
    openai_job_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Evaluations table
CREATE TABLE IF NOT EXISTS harmony_model_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id VARCHAR(255) UNIQUE NOT NULL,
    job_id VARCHAR(255) REFERENCES harmony_training_jobs(job_id),
    evaluation_type VARCHAR(50) NOT NULL,
    test_suite JSONB NOT NULL,
    results JSONB NOT NULL DEFAULT '{}',
    harmony_compliance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- GPT-OSS-20B SECURITY TABLES
-- ========================================

-- GPT-OSS Requests table
CREATE TABLE IF NOT EXISTS gpt_oss_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    prompt TEXT NOT NULL,
    security_context JSONB NOT NULL,
    constraints JSONB DEFAULT '{}',
    container_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'blocked')),
    processing_time_ms INTEGER,
    tokens JSONB DEFAULT '{}',
    security_assessment JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- GPT-OSS Security Events table
CREATE TABLE IF NOT EXISTS gpt_oss_security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    request_id VARCHAR(255) REFERENCES gpt_oss_requests(request_id),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    mitigation_applied BOOLEAN DEFAULT false,
    mitigation_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- NOVA CUSTOM MODELS TABLES
-- ========================================

-- Custom Models table
CREATE TABLE IF NOT EXISTS nova_custom_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('ticket_classifier', 'incident_predictor', 'knowledge_extractor', 'auto_resolver', 'sentiment_analyzer', 'priority_scorer')),
    version VARCHAR(50) NOT NULL,
    description TEXT,
    architecture JSONB NOT NULL DEFAULT '{}',
    performance JSONB NOT NULL DEFAULT '{}',
    domain JSONB NOT NULL DEFAULT '{}',
    training JSONB NOT NULL DEFAULT '{}',
    deployment JSONB NOT NULL DEFAULT '{}',
    business_impact JSONB NOT NULL DEFAULT '{}',
    model_path TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom Model Requests table
CREATE TABLE IF NOT EXISTS nova_custom_model_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(255) REFERENCES nova_custom_models(model_id),
    user_id VARCHAR(255),
    input_data JSONB NOT NULL,
    context JSONB DEFAULT '{}',
    options JSONB DEFAULT '{}',
    prediction JSONB,
    confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
    explanation JSONB,
    business_context JSONB,
    processing_time_ms INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- KNOWLEDGE MANAGEMENT TABLES
-- ========================================

-- ITSM Knowledge Base table
CREATE TABLE IF NOT EXISTS itsm_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_id VARCHAR(255) UNIQUE NOT NULL,
    knowledge_type VARCHAR(50) NOT NULL CHECK (knowledge_type IN ('incident', 'problem', 'change', 'request', 'knowledge_article')),
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    priority VARCHAR(20),
    status VARCHAR(50),
    resolution TEXT,
    symptoms TEXT[] DEFAULT '{}',
    causes TEXT[] DEFAULT '{}',
    solutions TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    confidence DECIMAL(5, 4) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(5, 4) DEFAULT 0.5 CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
    vector_embedding vector(1536), -- For similarity search
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RAG Documents table
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(100),
    source VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    chunk_count INTEGER DEFAULT 1,
    vector_embedding vector(1536),
    checksum VARCHAR(64),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RAG Chunks table
CREATE TABLE IF NOT EXISTS rag_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id VARCHAR(255) UNIQUE NOT NULL,
    document_id VARCHAR(255) REFERENCES rag_documents(document_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    vector_embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- MCP SERVER TABLES
-- ========================================

-- MCP Sessions table
CREATE TABLE IF NOT EXISTS mcp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    client_id VARCHAR(255),
    client_info JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'terminated')),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MCP Tool Calls table
CREATE TABLE IF NOT EXISTS mcp_tool_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id VARCHAR(255) UNIQUE NOT NULL,
    session_id VARCHAR(255) REFERENCES mcp_sessions(session_id),
    tool_name VARCHAR(255) NOT NULL,
    parameters JSONB DEFAULT '{}',
    result JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processing_time_ms INTEGER,
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- SYSTEM CONFIGURATION TABLES
-- ========================================

-- AI Configuration table
CREATE TABLE IF NOT EXISTS ai_configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feature Flags table
CREATE TABLE IF NOT EXISTS ai_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(255) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    conditions JSONB DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ========================================

-- AI Providers indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_type ON ai_providers(type);
CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON ai_providers(is_active, health_status);

-- AI Requests indexes
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_status ON ai_requests(status);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_provider ON ai_requests(provider_id, created_at);

-- AI Metrics indexes
CREATE INDEX IF NOT EXISTS idx_ai_metrics_type ON ai_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_timestamp ON ai_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_provider ON ai_metrics(provider_id, timestamp);

-- AI Audit Events indexes
CREATE INDEX IF NOT EXISTS idx_ai_audit_user_id ON ai_audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_event_type ON ai_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_audit_risk_level ON ai_audit_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_audit_created_at ON ai_audit_events(created_at);

-- Nova Models indexes
CREATE INDEX IF NOT EXISTS idx_nova_models_type ON nova_models(model_type);
CREATE INDEX IF NOT EXISTS idx_nova_models_status ON nova_models(status);

-- Knowledge Base indexes
CREATE INDEX IF NOT EXISTS idx_itsm_knowledge_category ON itsm_knowledge(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_itsm_knowledge_type ON itsm_knowledge(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_itsm_knowledge_tags ON itsm_knowledge USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_itsm_knowledge_text_search ON itsm_knowledge USING GIN(to_tsvector('english', title || ' ' || description));

-- Vector similarity indexes (if vector extension available)
CREATE INDEX IF NOT EXISTS idx_itsm_knowledge_vector ON itsm_knowledge USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_rag_documents_vector ON rag_documents USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_vector ON rag_chunks USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);

-- ========================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nova_models_updated_at BEFORE UPDATE ON nova_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_harmony_datasets_updated_at BEFORE UPDATE ON harmony_datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_harmony_training_jobs_updated_at BEFORE UPDATE ON harmony_training_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nova_custom_models_updated_at BEFORE UPDATE ON nova_custom_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rag_documents_updated_at BEFORE UPDATE ON rag_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_configuration_updated_at BEFORE UPDATE ON ai_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_feature_flags_updated_at BEFORE UPDATE ON ai_feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DEFAULT CONFIGURATION DATA
-- ========================================

-- Insert default AI configuration
INSERT INTO ai_configuration (config_key, config_value, config_type, description) VALUES
('ai_fabric.enabled', 'true', 'boolean', 'Enable AI Fabric system'),
('ai_fabric.max_concurrent_requests', '100', 'integer', 'Maximum concurrent AI requests'),
('ai_fabric.default_timeout_ms', '30000', 'integer', 'Default request timeout in milliseconds'),
('monitoring.enabled', 'true', 'boolean', 'Enable AI monitoring and metrics'),
('compliance.gdpr_enabled', 'true', 'boolean', 'Enable GDPR compliance features'),
('compliance.audit_retention_days', '2555', 'integer', 'Audit log retention period in days (7 years)'),
('security.encryption_enabled', 'true', 'boolean', 'Enable data encryption'),
('performance.auto_scaling_enabled', 'true', 'boolean', 'Enable automatic scaling'),
('rag.enabled', 'true', 'boolean', 'Enable RAG functionality'),
('rag.embedding_model', '"text-embedding-ada-002"', 'string', 'Default embedding model for RAG')
ON CONFLICT (config_key) DO NOTHING;

-- Insert default feature flags
INSERT INTO ai_feature_flags (flag_name, is_enabled, rollout_percentage, description) VALUES
('real_time_learning', true, 100, 'Enable real-time learning from user feedback'),
('advanced_analytics', true, 100, 'Enable advanced AI analytics and insights'),
('custom_models', true, 100, 'Enable Nova custom AI models'),
('federated_learning', false, 0, 'Enable federated learning capabilities'),
('quantum_ready', false, 0, 'Enable quantum computing readiness features'),
('multimodal_ai', true, 50, 'Enable multi-modal AI capabilities'),
('ab_testing', true, 100, 'Enable A/B testing for AI models'),
('bias_detection', true, 100, 'Enable automated bias detection'),
('drift_detection', true, 100, 'Enable model drift detection'),
('explainable_ai', true, 100, 'Enable explainable AI features')
ON CONFLICT (flag_name) DO NOTHING;

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- AI Performance Summary View
CREATE OR REPLACE VIEW ai_performance_summary AS
SELECT 
    DATE_TRUNC('hour', ar.created_at) as hour,
    ar.provider_id,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE ar.status = 'completed') as completed_requests,
    COUNT(*) FILTER (WHERE ar.status = 'failed') as failed_requests,
    AVG(ar.processing_time_ms) as avg_processing_time,
    AVG(resp.confidence) as avg_confidence,
    SUM(ar.tokens_used) as total_tokens,
    SUM(ar.cost_usd) as total_cost
FROM ai_requests ar
LEFT JOIN ai_responses resp ON ar.request_id = resp.request_id
WHERE ar.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', ar.created_at), ar.provider_id
ORDER BY hour DESC;

-- AI Audit Summary View
CREATE OR REPLACE VIEW ai_audit_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as day,
    event_type,
    risk_level,
    COUNT(*) as event_count
FROM ai_audit_events
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), event_type, risk_level
ORDER BY day DESC, event_count DESC;

-- Model Performance View
CREATE OR REPLACE VIEW model_performance_summary AS
SELECT 
    nm.model_id,
    nm.name,
    nm.model_type,
    nm.status,
    nm.accuracy,
    COUNT(ncmr.id) as total_predictions,
    AVG(ncmr.confidence) as avg_confidence,
    AVG(ncmr.processing_time_ms) as avg_processing_time
FROM nova_custom_models nm
LEFT JOIN nova_custom_model_requests ncmr ON nm.model_id = ncmr.model_id
WHERE ncmr.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY nm.model_id, nm.name, nm.model_type, nm.status, nm.accuracy
ORDER BY total_predictions DESC;

-- ========================================
-- SECURITY POLICIES (Row Level Security)
-- ========================================

-- Enable RLS on sensitive tables
ALTER TABLE ai_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpt_oss_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for audit events (restrict to admin users)
CREATE POLICY ai_audit_admin_policy ON ai_audit_events
    FOR ALL TO nova_admin_role
    USING (true);

CREATE POLICY ai_audit_user_policy ON ai_audit_events
    FOR SELECT TO nova_user_role
    USING (user_id = current_setting('app.current_user_id', true));

-- Create policies for AI requests (users can only see their own)
CREATE POLICY ai_requests_user_policy ON ai_requests
    FOR ALL TO nova_user_role
    USING (user_id = current_setting('app.current_user_id', true));

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE ai_providers IS 'Registry of all AI providers and their configurations';
COMMENT ON TABLE ai_requests IS 'Log of all AI requests made through the fabric';
COMMENT ON TABLE ai_responses IS 'Responses from AI providers with metadata';
COMMENT ON TABLE ai_metrics IS 'Performance and usage metrics for AI systems';
COMMENT ON TABLE ai_audit_events IS 'Comprehensive audit log for AI operations';
COMMENT ON TABLE nova_models IS 'Nova-trained local AI models';
COMMENT ON TABLE itsm_knowledge IS 'ITSM knowledge base for RAG and recommendations';
COMMENT ON TABLE mcp_sessions IS 'Active MCP server sessions for ChatGPT integration';

-- ========================================
-- MAINTENANCE PROCEDURES
-- ========================================

-- Function to clean up old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    retention_days INTEGER;
    deleted_count INTEGER;
BEGIN
    -- Get retention policy from configuration
    SELECT (config_value::INTEGER) INTO retention_days 
    FROM ai_configuration 
    WHERE config_key = 'compliance.audit_retention_days';
    
    -- Default to 7 years if not configured
    IF retention_days IS NULL THEN
        retention_days := 2555;
    END IF;
    
    -- Delete old audit events
    DELETE FROM ai_audit_events 
    WHERE created_at < CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL
    AND retention_until IS NOT NULL 
    AND retention_until < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update model performance metrics
CREATE OR REPLACE FUNCTION update_model_performance_metrics()
RETURNS VOID AS $$
BEGIN
    -- Update usage counts for ITSM knowledge
    UPDATE itsm_knowledge 
    SET usage_count = (
        SELECT COUNT(*) 
        FROM nova_custom_model_requests ncmr
        WHERE ncmr.prediction->>'related_knowledge' @> jsonb_build_array(itsm_knowledge.knowledge_id)
        AND ncmr.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    );
    
    -- Update effectiveness scores based on user feedback
    UPDATE itsm_knowledge 
    SET effectiveness_score = COALESCE((
        SELECT AVG(CASE 
            WHEN resp.user_feedback = 'positive' THEN 1.0
            WHEN resp.user_feedback = 'neutral' THEN 0.5
            WHEN resp.user_feedback = 'negative' THEN 0.0
            ELSE 0.5
        END)
        FROM ai_responses resp
        JOIN ai_requests req ON resp.request_id = req.request_id
        WHERE resp.response_data->>'related_knowledge' @> jsonb_build_array(itsm_knowledge.knowledge_id)
        AND req.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    ), effectiveness_score);
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance jobs (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');
-- SELECT cron.schedule('update-model-metrics', '0 3 * * *', 'SELECT update_model_performance_metrics();');

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Nova AI Fabric database schema migration completed successfully!';
    RAISE NOTICE 'Created % tables with indexes, triggers, and views', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = current_schema() 
        AND table_name LIKE 'ai_%' OR table_name LIKE 'nova_%' OR table_name LIKE 'harmony_%' OR table_name LIKE 'gpt_oss_%' OR table_name LIKE 'mcp_%' OR table_name LIKE 'rag_%' OR table_name = 'itsm_knowledge'
    );
END $$;