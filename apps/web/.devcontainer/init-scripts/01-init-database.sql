-- Xaheen CLI Ecosystem Database Initialization
-- This script sets up the development database with proper Norwegian compliance

-- Create additional databases
CREATE DATABASE xaheen_test;
CREATE DATABASE xaheen_analytics;

-- Create development user with limited privileges
CREATE USER xaheen_dev WITH PASSWORD 'dev_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE xaheen_dev TO xaheen_dev;
GRANT ALL PRIVILEGES ON DATABASE xaheen_test TO xaheen_dev;
GRANT CONNECT ON DATABASE xaheen_analytics TO xaheen_dev;

-- Connect to main database
\c xaheen_dev;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create schemas for Norwegian compliance
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS gdpr;
CREATE SCHEMA IF NOT EXISTS nsm;

-- Grant schema permissions
GRANT ALL ON SCHEMA audit TO xaheen_dev;
GRANT ALL ON SCHEMA gdpr TO xaheen_dev;
GRANT ALL ON SCHEMA nsm TO xaheen_dev;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    nsm_classification VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create GDPR consent tracking
CREATE TABLE IF NOT EXISTS gdpr.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    legal_basis VARCHAR(100),
    purpose TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NSM classification tracking
CREATE TABLE IF NOT EXISTS nsm.data_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET')),
    rationale TEXT,
    classified_by VARCHAR(255),
    classification_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX idx_activity_log_user_id ON audit.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON audit.activity_log(created_at);
CREATE INDEX idx_activity_log_action ON audit.activity_log(action);
CREATE INDEX idx_activity_log_nsm_classification ON audit.activity_log(nsm_classification);

CREATE INDEX idx_consent_records_user_id ON gdpr.consent_records(user_id);
CREATE INDEX idx_consent_records_consent_type ON gdpr.consent_records(consent_type);
CREATE INDEX idx_consent_records_expiry_date ON gdpr.consent_records(expiry_date);

CREATE INDEX idx_data_classifications_resource ON nsm.data_classifications(resource_type, resource_id);
CREATE INDEX idx_data_classifications_classification ON nsm.data_classifications(classification);
CREATE INDEX idx_data_classifications_review_date ON nsm.data_classifications(review_date);

-- Insert initial development data
INSERT INTO nsm.data_classifications (resource_type, resource_id, classification, rationale, classified_by) VALUES
('component', 'default', 'OPEN', 'Default classification for development components', 'system'),
('template', 'default', 'OPEN', 'Default classification for development templates', 'system'),
('user_data', 'development', 'RESTRICTED', 'Development user data requires restricted access', 'system');

-- Create function for automatic audit logging
CREATE OR REPLACE FUNCTION audit.log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.activity_log (
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to development user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO xaheen_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA gdpr TO xaheen_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA nsm TO xaheen_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO xaheen_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA gdpr TO xaheen_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA nsm TO xaheen_dev;

-- Add development-friendly settings
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 0;
SELECT pg_reload_conf();