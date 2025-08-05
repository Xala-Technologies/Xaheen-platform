#!/usr/bin/env node

/**
 * Health Check Script for Xaheen CLI Production Deployment
 * Norwegian Enterprise Grade with NSM Security Compliance
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Health check configuration
const CONFIG = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  timeout: parseInt(process.env.HEALTHCHECK_TIMEOUT) || 5000,
  retries: parseInt(process.env.HEALTHCHECK_RETRIES) || 3,
  interval: parseInt(process.env.HEALTHCHECK_INTERVAL) || 1000,
  
  // Norwegian compliance
  nsmClassification: process.env.NSM_CLASSIFICATION || 'RESTRICTED',
  norwegianLocale: process.env.NORWEGIAN_LOCALE || 'nb-NO',
  
  // Application checks
  checks: {
    application: true,
    database: process.env.DATABASE_URL ? true : false,
    redis: process.env.REDIS_URL ? true : false,
    vault: process.env.VAULT_ADDR ? true : false,
    monitoring: process.env.PROMETHEUS_ENABLED === 'true',
  }
};

/**
 * Perform HTTP health check
 */
async function httpHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: '/health',
      method: 'GET',
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Xaheen-HealthCheck/1.0',
        'Accept': 'application/json',
        'X-NSM-Classification': CONFIG.nsmClassification,
        'X-Norwegian-Locale': CONFIG.norwegianLocale
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const healthData = JSON.parse(data);
            resolve({
              status: 'healthy',
              statusCode: res.statusCode,
              data: healthData,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            resolve({
              status: 'healthy',
              statusCode: res.statusCode,
              data: data,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          reject(new Error(`Health check failed with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Health check request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Health check timed out after ${CONFIG.timeout}ms`));
    });

    req.end();
  });
}

/**
 * Check file system health
 */
function fileSystemHealthCheck() {
  const checks = [];
  
  // Check if application files exist
  const requiredFiles = [
    'dist/index.js',
    'package.json'
  ];
  
  for (const file of requiredFiles) {
    try {
      fs.accessSync(path.join(process.cwd(), file), fs.constants.R_OK);
      checks.push({ file, status: 'ok' });
    } catch (error) {
      checks.push({ file, status: 'error', error: error.message });
    }
  }
  
  // Check writable directories
  const writableDirectories = ['logs', 'tmp', 'cache'];
  
  for (const dir of writableDirectories) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      checks.push({ directory: dir, status: 'ok' });
    } catch (error) {
      // Try to create directory if it doesn't exist
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        checks.push({ directory: dir, status: 'created' });
      } catch (createError) {
        checks.push({ directory: dir, status: 'error', error: createError.message });
      }
    }
  }
  
  return checks;
}

/**
 * Check application dependencies
 */
function dependenciesHealthCheck() {
  const checks = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const requiredNodeVersion = '20';
  
  checks.push({
    dependency: 'nodejs',
    version: nodeVersion,
    status: nodeVersion.startsWith('v' + requiredNodeVersion) ? 'ok' : 'warning',
    required: `v${requiredNodeVersion}.x.x`
  });
  
  // Check memory usage
  const memUsage = process.memoryUsage();
  const memoryThreshold = 512 * 1024 * 1024; // 512MB
  
  checks.push({
    dependency: 'memory',
    used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    status: memUsage.heapUsed < memoryThreshold ? 'ok' : 'warning'
  });
  
  return checks;
}

/**
 * Norwegian compliance checks
 */
function norwegianComplianceCheck() {
  const checks = [];
  
  // NSM Classification check
  checks.push({
    compliance: 'nsm-classification',
    value: CONFIG.nsmClassification,
    status: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'].includes(CONFIG.nsmClassification) ? 'ok' : 'error'
  });
  
  // Norwegian locale check
  checks.push({
    compliance: 'norwegian-locale',
    value: CONFIG.norwegianLocale,
    status: CONFIG.norwegianLocale.startsWith('nb-') ? 'ok' : 'warning'
  });
  
  // Timezone check
  const timezone = process.env.TZ || 'UTC';
  checks.push({
    compliance: 'timezone',
    value: timezone,
    status: timezone === 'Europe/Oslo' ? 'ok' : 'warning'
  });
  
  // GDPR compliance check
  const gdprCompliant = process.env.GDPR_COMPLIANCE === 'true';
  checks.push({
    compliance: 'gdpr',
    value: gdprCompliant,
    status: gdprCompliant ? 'ok' : 'error'
  });
  
  return checks;
}

/**
 * Perform comprehensive health check
 */
async function performHealthCheck() {
  const healthReport = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    version: process.env.VERSION || 'unknown',
    buildDate: process.env.BUILD_DATE || 'unknown',
    gitCommit: process.env.VCS_REF || 'unknown',
    
    // Norwegian enterprise metadata
    norwegianCompliance: {
      nsmClassification: CONFIG.nsmClassification,
      locale: CONFIG.norwegianLocale,
      timezone: process.env.TZ || 'UTC',
      gdprCompliant: process.env.GDPR_COMPLIANCE === 'true'
    },
    
    checks: {
      filesystem: fileSystemHealthCheck(),
      dependencies: dependenciesHealthCheck(),
      compliance: norwegianComplianceCheck()
    },
    
    uptime: Math.floor(process.uptime()),
    pid: process.pid
  };
  
  // Perform HTTP health check if application is supposed to be running
  if (CONFIG.checks.application) {
    try {
      const httpCheck = await httpHealthCheck();
      healthReport.checks.http = httpCheck;
    } catch (error) {
      healthReport.status = 'unhealthy';
      healthReport.checks.http = {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Check for any errors in sub-checks
  const hasErrors = Object.values(healthReport.checks).some(checkGroup => {
    if (Array.isArray(checkGroup)) {
      return checkGroup.some(check => check.status === 'error');
    }
    return checkGroup.status === 'error';
  });
  
  if (hasErrors) {
    healthReport.status = 'unhealthy';
  }
  
  return healthReport;
}

/**
 * Main health check execution
 */
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🏥 Starting Xaheen CLI health check...');
    console.log(`📋 NSM Classification: ${CONFIG.nsmClassification}`);
    console.log(`🇳🇴 Norwegian Locale: ${CONFIG.norwegianLocale}`);
    
    const healthReport = await performHealthCheck();
    const duration = Date.now() - startTime;
    
    healthReport.checkDuration = `${duration}ms`;
    
    if (healthReport.status === 'healthy') {
      console.log('✅ Health check passed');
      console.log(`⏱️  Duration: ${duration}ms`);
      
      // Output health report in JSON format for structured logging
      if (process.env.LOG_FORMAT === 'json') {
        console.log(JSON.stringify(healthReport, null, 2));
      }
      
      process.exit(0);
    } else {
      console.error('❌ Health check failed');
      console.error(JSON.stringify(healthReport, null, 2));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Health check crashed:', error.message);
    console.error('Stack trace:', error.stack);
    
    const crashReport = {
      status: 'crashed',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      norwegianCompliance: {
        nsmClassification: CONFIG.nsmClassification,
        locale: CONFIG.norwegianLocale
      }
    };
    
    console.error(JSON.stringify(crashReport, null, 2));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Health check received SIGTERM, exiting gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Health check received SIGINT, exiting gracefully...');
  process.exit(0);
});

// Run health check if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  performHealthCheck,
  httpHealthCheck,
  fileSystemHealthCheck,
  dependenciesHealthCheck,
  norwegianComplianceCheck
};