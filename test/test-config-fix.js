#!/usr/bin/env node

// Test script to verify configuration loading fix
import { logger } from '../apps/api/logger.js';
import ConfigurationManager from '../apps/api/config/app-settings.js';

async function testConfigurationLoading() {
  try {
    logger.info('Testing configuration loading...');
    
    // Test loading from database
    const dbConfig = await ConfigurationManager.loadFromDatabase();
    logger.info('✅ Database configuration loaded successfully:', Object.keys(dbConfig));
    
    // Test full configuration loading
    const fullConfig = await ConfigurationManager.getFullConfig();
    logger.info('✅ Full configuration loaded successfully');
    logger.info('Configuration structure:', Object.keys(fullConfig));
    
    // Test initialization
    await ConfigurationManager.initialize();
    logger.info('✅ Configuration manager initialized successfully');
    
    logger.info('🎉 All configuration tests passed!');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Configuration loading failed:', error);
    process.exit(1);
  }
}

testConfigurationLoading();
