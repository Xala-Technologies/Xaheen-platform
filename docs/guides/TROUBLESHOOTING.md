# CLI v2 Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with Xaheen CLI v2.

## Quick Diagnostics

### System Health Check
```bash
# Run comprehensive diagnostics
xaheen doctor

# Check specific components
xaheen doctor --check system,registry,templates

# Generate detailed report
xaheen doctor --report --output health-report.json
```

### Project Validation
```bash
# Validate current project
xaheen validate

# Auto-fix detected issues
xaheen validate --fix

# Validate specific services
xaheen validate --services auth,database
```

---

## Installation Issues

### Issue: CLI Not Found After Installation

**Symptoms:**
```bash
xaheen create my-app
# Command 'xaheen' not found
```

**Causes:**
- CLI not installed globally
- Wrong registry configuration
- PATH issues

**Solutions:**

1. **Check if CLI is installed:**
```bash
npm list -g @xala-technologies/xaheen-cli
```

2. **Reinstall with correct registry:**
```bash
npm install -g @xala-technologies/xaheen-cli --registry=https://npm.pkg.github.com
```

3. **Configure registry permanently:**
```bash
echo "@xala-technologies:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install -g @xala-technologies/xaheen-cli
```

4. **Check npm global path:**
```bash
npm config get prefix
# Make sure this directory is in your PATH
```

5. **Alternative: Use npx directly:**
```bash
npx --registry=https://npm.pkg.github.com @xala-technologies/xaheen-cli create my-app
```

### Issue: Registry Access Denied

**Symptoms:**
```bash
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@xala-technologies/xaheen-cli
npm ERR! 403 Forbidden - GET https://npm.pkg.github.com/@xala-technologies/xaheen-cli
```

**Causes:**
- Missing GitHub Packages registry configuration
- Authentication issues
- Network/firewall restrictions

**Solutions:**

1. **Configure GitHub Packages registry:**
```bash
npm config set @xala-technologies:registry https://npm.pkg.github.com
```

2. **Check registry configuration:**
```bash
npm config get @xala-technologies:registry
# Should return: https://npm.pkg.github.com
```

3. **For corporate networks, configure proxy:**
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

4. **Use .npmrc file:**
```bash
# ~/.npmrc
@xala-technologies:registry=https://npm.pkg.github.com
```

### Issue: Node.js Version Compatibility

**Symptoms:**
```bash
node: Unsupported engine
npm WARN engine @xala-technologies/xaheen-cli@2.0.2: wanted: {"node":">=18.0.0"}
```

**Causes:**
- Node.js version below 18.0.0
- Outdated npm version

**Solutions:**

1. **Check current Node.js version:**
```bash
node --version
```

2. **Upgrade Node.js (using nvm):**
```bash
# Install nvm if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
nvm alias default node
```

3. **Alternative: Direct Node.js installation:**
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (18.0.0 or higher)

4. **Verify installation:**
```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

---

## Command Execution Issues

### Issue: Command Fails Silently

**Symptoms:**
```bash
xaheen create my-app --preset saas-starter
# No output, command exits without error or success message
```

**Causes:**
- Network connectivity issues
- Registry timeout
- Template loading failure

**Solutions:**

1. **Enable verbose logging:**
```bash
XAHEEN_DEBUG=true xaheen create my-app --preset saas-starter --verbose
```

2. **Check network connectivity:**
```bash
# Test GitHub Packages access
curl -I https://npm.pkg.github.com/@xala-technologies/xaheen-cli
```

3. **Use dry-run to test configuration:**
```bash
xaheen create my-app --preset saas-starter --dry-run
```

4. **Check system resources:**
```bash
# Check available disk space
df -h

# Check memory usage
free -h

# Check if any processes are blocking
lsof | grep xaheen
```

### Issue: Bundle Not Found

**Symptoms:**
```bash
xaheen create my-app --preset custom-bundle
# Error: Bundle 'custom-bundle' not found
```

**Causes:**
- Typo in bundle name
- Bundle not available in current CLI version
- Registry sync issues

**Solutions:**

1. **List available bundles:**
```bash
xaheen bundle list
```

2. **Check bundle name spelling:**
```bash
# Available bundles:
# saas-starter, saas-professional, saas-complete
# marketing-site, portfolio-site, dashboard-app
# fullstack-app, mobile-app, rest-api
# enterprise-app, norwegian-gov, municipality-portal
# healthcare-management
```

3. **Use interactive mode:**
```bash
xaheen create my-app
# CLI will prompt for bundle selection
```

4. **Clear template cache:**
```bash
rm -rf ~/.xaheen/cache
xaheen bundle list
```

### Issue: Service Provider Not Found

**Symptoms:**
```bash
xaheen add auth --provider custom-provider
# Error: Service provider 'custom-provider' not found
```

**Causes:**
- Provider name typo
- Provider not supported
- Service type mismatch

**Solutions:**

1. **List available providers for service:**
```bash
xaheen add auth --help
# Shows all available auth providers
```

2. **Check supported providers:**
```bash
# Auth providers: clerk, auth0, better-auth, bankid, identity-server
# Database providers: postgresql, mysql, mongodb, sqlite, sqlserver
# Payment providers: stripe, vipps, paypal, paddle, square
```

3. **Use interactive mode:**
```bash
xaheen add auth
# CLI will prompt for provider selection
```

4. **Check service compatibility:**
```bash
xaheen validate --services auth
```

---

## Project Generation Issues

### Issue: Project Creation Fails

**Symptoms:**
```bash
xaheen create my-app --preset saas-starter
# Error: Template processing failed
# Error: Failed to generate project files
```

**Causes:**
- Insufficient disk space
- File permission issues
- Template corruption
- Directory already exists

**Solutions:**

1. **Check disk space:**
```bash
df -h .
# Ensure at least 500MB free space
```

2. **Check directory permissions:**
```bash
ls -la .
# Ensure write permissions for current directory
```

3. **Use different directory:**
```bash
mkdir ~/projects
cd ~/projects
xaheen create my-app --preset saas-starter
```

4. **Force overwrite existing directory:**
```bash
xaheen create my-app --preset saas-starter --force
```

5. **Clear template cache:**
```bash
rm -rf ~/.xaheen/cache
xaheen create my-app --preset saas-starter
```

### Issue: Dependency Installation Fails

**Symptoms:**
```bash
# During project creation:
npm ERR! Error installing dependencies
npm ERR! peer dep missing: react@^18.0.0
```

**Causes:**
- Network connectivity issues
- Conflicting dependencies
- Registry access problems
- Insufficient disk space

**Solutions:**

1. **Skip automatic installation:**
```bash
xaheen create my-app --preset saas-starter --no-install
cd my-app
npm install
```

2. **Use different package manager:**
```bash
xaheen create my-app --preset saas-starter --no-install
cd my-app
pnpm install  # or yarn install, bun install
```

3. **Clear npm cache:**
```bash
npm cache clean --force
cd my-app
npm install
```

4. **Install with legacy peer deps:**
```bash
cd my-app
npm install --legacy-peer-deps
```

5. **Check package-lock.json:**
```bash
cd my-app
rm -f package-lock.json node_modules
npm install
```

### Issue: Git Initialization Fails

**Symptoms:**
```bash
# During project creation:
Error: Git initialization failed
fatal: not a git repository
```

**Causes:**
- Git not installed
- Git configuration missing
- Directory permission issues

**Solutions:**

1. **Check Git installation:**
```bash
git --version
# If not found, install Git
```

2. **Configure Git:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

3. **Skip Git initialization:**
```bash
xaheen create my-app --preset saas-starter --no-git
```

4. **Initialize Git manually:**
```bash
cd my-app
git init
git add .
git commit -m "Initial commit"
```

---

## Service Management Issues

### Issue: Adding Service Fails

**Symptoms:**
```bash
xaheen add auth --provider clerk
# Error: Incompatible with existing services
# Error: Failed to inject service
```

**Causes:**
- Service compatibility issues
- Existing service conflicts
- Template processing errors
- File permission issues

**Solutions:**

1. **Check compatibility:**
```bash
xaheen add auth --provider clerk --dry-run
```

2. **Force add service:**
```bash
xaheen add auth --provider clerk --force
```

3. **Remove conflicting service first:**
```bash
xaheen remove auth --provider existing-provider
xaheen add auth --provider clerk
```

4. **Validate project state:**
```bash
xaheen validate --fix
xaheen add auth --provider clerk
```

### Issue: Service Removal Fails

**Symptoms:**
```bash
xaheen remove auth --provider clerk
# Error: Service has dependents
# Error: Cannot remove required service
```

**Causes:**
- Service has dependent services
- Service is required by bundle
- Dependency resolution issues

**Solutions:**

1. **Check service dependencies:**
```bash
xaheen remove auth --provider clerk --dry-run
```

2. **Force removal:**
```bash
xaheen remove auth --provider clerk --force
```

3. **Remove dependents first:**
```bash
# Remove services that depend on auth
xaheen remove payments --provider stripe
xaheen remove auth --provider clerk
```

4. **Clean up after removal:**
```bash
xaheen remove auth --provider clerk --clean
```

---

## Norwegian Compliance Issues

### Issue: BankID Integration Fails

**Symptoms:**
```bash
# BankID authentication fails
Error: Invalid client configuration
Error: Certificate validation failed
```

**Causes:**
- Incorrect environment configuration
- Missing certificates (production)
- Invalid client credentials
- Network connectivity issues

**Solutions:**

1. **Check environment configuration:**
```bash
# .env.local
BANKID_ENVIRONMENT=test  # Use 'test' for development
BANKID_CLIENT_ID=your-test-client-id
BANKID_CLIENT_SECRET=your-test-client-secret
BANKID_REDIRECT_URI=http://localhost:3000/auth/bankid/callback
```

2. **Verify test environment access:**
```bash
curl -I https://oidc-ver1.difi.no/idporten-oidc-provider/.well-known/openid_configuration
```

3. **For production, check certificates:**
```bash
# Ensure certificates are properly formatted
echo "$BANKID_CERTIFICATE" | openssl x509 -text -noout
```

4. **Test with minimal configuration:**
```typescript
// Test BankID configuration
const config = {
  environment: 'test',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/auth/bankid/callback'
};

console.log('BankID config:', config);
```

### Issue: Vipps Payment Integration Fails

**Symptoms:**
```bash
# Vipps payment initiation fails
Error: Invalid merchant configuration
Error: Subscription key invalid
```

**Causes:**
- Incorrect API credentials
- Wrong environment configuration
- Subscription key issues
- Network connectivity problems

**Solutions:**

1. **Verify Vipps configuration:**
```bash
# .env.local
VIPPS_ENVIRONMENT=test
VIPPS_CLIENT_ID=your-test-client-id
VIPPS_CLIENT_SECRET=your-test-client-secret
VIPPS_SUBSCRIPTION_KEY=your-subscription-key
VIPPS_MERCHANT_SERIAL_NUMBER=123456
```

2. **Test API access:**
```bash
curl -X POST https://apitest.vipps.no/accesstoken/get \
  -H "Content-Type: application/json" \
  -H "Ocp-Apim-Subscription-Key: your-subscription-key" \
  -H "client_id: your-client-id" \
  -H "client_secret: your-client-secret"
```

3. **Check merchant configuration:**
```bash
# Verify merchant serial number format (6 digits)
echo $VIPPS_MERCHANT_SERIAL_NUMBER | grep -E '^[0-9]{6}$'
```

4. **Use test data:**
```typescript
// Test Vipps with minimal payment
const testPayment = {
  orderId: 'test-' + Date.now(),
  amount: 100, // 1 NOK in øre
  description: 'Test payment'
};
```

### Issue: Altinn Integration Fails

**Symptoms:**
```bash
# Altinn API calls fail  
Error: API key invalid
Error: Organization not authorized
```

**Causes:**
- Invalid API credentials
- Organization not registered
- Insufficient permissions
- Environment mismatch

**Solutions:**

1. **Verify Altinn configuration:**
```bash
# .env.local
ALTINN_ENVIRONMENT=test
ALTINN_API_KEY=your-api-key
ALTINN_SUBSCRIPTION_KEY=your-subscription-key
ALTINN_ORG_NUMBER=123456789
```

2. **Test API access:**
```bash
curl -X GET https://tt02.altinn.no/api/metadata/services \
  -H "ApiKey: your-api-key" \
  -H "Ocp-Apim-Subscription-Key: your-subscription-key"
```

3. **Validate organization number:**
```typescript
// Norwegian organization number validation
function validateOrgNumber(orgNumber: string): boolean {
  const digits = orgNumber.replace(/\D/g, '');
  if (digits.length !== 9) return false;
  
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return checkDigit === parseInt(digits[8]);
}

console.log(validateOrgNumber('123456789')); // false (example)
```

---

## Performance Issues

### Issue: Slow Project Generation

**Symptoms:**
- Project creation takes longer than 5 minutes
- CLI appears to hang during generation
- High memory usage during creation

**Causes:**
- Large templates
- Network latency
- Insufficient system resources
- Template cache issues

**Solutions:**

1. **Check system resources:**
```bash
# Monitor during generation
top
htop
# Or on macOS:
Activity Monitor
```

2. **Use local template cache:**
```bash
# Pre-warm template cache
xaheen bundle list
xaheen bundle show saas-starter
```

3. **Reduce concurrent operations:**
```bash
# Set concurrency limit
XAHEEN_CONCURRENCY=2 xaheen create my-app --preset saas-starter
```

4. **Use minimal bundle:**
```bash
# Start with marketing-site (fastest)
xaheen create my-app --preset marketing-site
```

5. **Monitor memory usage:**
```bash
# Check available memory
free -h
# Or on macOS:
vm_stat
```

### Issue: High Memory Usage

**Symptoms:**
- CLI process uses excessive memory (>1GB)
- System becomes slow during CLI operations
- Out of memory errors

**Causes:**
- Memory leaks in template processing
- Large template files
- Concurrent operations
- Template cache accumulation

**Solutions:**

1. **Clear template cache:**
```bash
rm -rf ~/.xaheen/cache
```

2. **Limit concurrent operations:**
```bash
export XAHEEN_CONCURRENCY=1
xaheen create my-app --preset saas-starter
```

3. **Monitor memory usage:**
```bash
# Monitor specific process
ps aux | grep xaheen
```

4. **Use dry-run for testing:**
```bash
xaheen create my-app --preset saas-starter --dry-run
```

5. **Restart CLI process:**
```bash
# Kill any hanging processes
pkill -f xaheen
```

---

## Network and Connectivity Issues

### Issue: Registry Timeout

**Symptoms:**
```bash
npm ERR! network timeout at: https://npm.pkg.github.com/@xala-technologies/xaheen-cli
```

**Causes:**
- Network connectivity issues
- Firewall blocking requests
- Registry server issues
- DNS resolution problems

**Solutions:**

1. **Test network connectivity:**
```bash
# Test GitHub Packages access
curl -I https://npm.pkg.github.com

# Test DNS resolution
nslookup npm.pkg.github.com
```

2. **Configure timeout settings:**
```bash
npm config set timeout 60000
npm config set registry-timeout 60000
```

3. **Use alternative network:**
```bash
# Try different network connection
# Mobile hotspot, different WiFi, etc.
```

4. **Configure proxy (if behind corporate firewall):**
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

5. **Use offline mode:**
```bash
# Work with cached packages only
npm config set offline true
xaheen create my-app --preset saas-starter --no-install
```

### Issue: Firewall Blocking Requests

**Symptoms:**
- Connection refused errors
- Timeout errors on specific domains
- SSL/TLS certificate errors

**Causes:**
- Corporate firewall rules
- Antivirus software blocking
- Network security policies
- VPN connectivity issues

**Solutions:**

1. **Check firewall settings:**
```bash
# On Linux
sudo iptables -L
ufw status

# On macOS
sudo pfctl -s all
```

2. **Test specific domains:**
```bash
# Test required domains
curl -I https://npm.pkg.github.com
curl -I https://api.vipps.no
curl -I https://oidc-ver1.difi.no
curl -I https://tt02.altinn.no
```

3. **Configure SSL settings:**
```bash
# Disable strict SSL (not recommended for production)
npm config set strict-ssl false
```

4. **Work with IT department:**
- Request whitelist for npm.pkg.github.com
- Request access to Norwegian government APIs
- Configure proxy settings properly

---

## Environment Variable Issues

### Issue: Missing Environment Variables

**Symptoms:**
```bash
Error: Missing required environment variable: DATABASE_URL
Error: AUTH_SECRET is not defined
```

**Causes:**
- Environment file not loaded
- Typos in variable names
- Wrong environment file location
- Missing values in CI/CD

**Solutions:**

1. **Check environment file location:**
```bash
# Next.js projects
ls -la .env*
# Should see: .env.local, .env.example

# Check if file is loaded
cat .env.local
```

2. **Copy from example:**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. **Validate environment variables:**
```bash
# Check specific variables
echo $DATABASE_URL
echo $AUTH_SECRET

# Load environment and check
source .env.local
echo $DATABASE_URL
```

4. **Use environment validation:**
```typescript
// Add to your project
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  BANKID_CLIENT_ID: z.string().optional(),
  VIPPS_CLIENT_ID: z.string().optional()
});

const env = envSchema.parse(process.env);
```

5. **Generate missing secrets:**
```bash
# Generate AUTH_SECRET
openssl rand -hex 32

# Generate random UUID
uuidgen

# Generate base64 secret
openssl rand -base64 32
```

---

## Template and Configuration Issues

### Issue: Template Processing Fails

**Symptoms:**
```bash
Error: Template compilation failed
Error: Handlebars syntax error
Error: Invalid template context
```

**Causes:**
- Corrupted template cache
- Template syntax errors
- Missing template variables
- Template compatibility issues

**Solutions:**

1. **Clear template cache:**
```bash
rm -rf ~/.xaheen/cache
xaheen create my-app --preset saas-starter
```

2. **Check template integrity:**
```bash
xaheen doctor --check templates
```

3. **Use different bundle:**
```bash
# Try simpler bundle first
xaheen create my-app --preset marketing-site
```

4. **Enable template debugging:**
```bash
XAHEEN_DEBUG=true xaheen create my-app --preset saas-starter
```

5. **Update CLI version:**
```bash
npm update -g @xala-technologies/xaheen-cli --registry=https://npm.pkg.github.com
```

### Issue: Configuration File Errors

**Symptoms:**
```bash
Error: Invalid configuration file
SyntaxError: Unexpected token in JSON
Error: Configuration schema validation failed
```

**Causes:**
- JSON syntax errors
- Invalid configuration values
- Missing required fields
- Wrong file format

**Solutions:**

1. **Validate JSON syntax:**
```bash
# Use JSON validator
cat xaheen.config.json | python -m json.tool

# Or use online validator
# Copy content to jsonlint.com
```

2. **Check configuration schema:**
```bash
xaheen validate --services configuration
```

3. **Reset to default configuration:**
```bash
# Backup current config
cp xaheen.config.json xaheen.config.json.backup

# Generate new config
xaheen create temp-project --preset saas-starter
cp temp-project/xaheen.config.json .
rm -rf temp-project
```

4. **Use configuration template:**
```javascript
// xaheen.config.js (instead of JSON)
/** @type {import('@xala-technologies/xaheen-cli').XaheenConfig} */
export default {
  name: "my-app",
  version: "2.0.0",
  services: {
    framework: {
      provider: "nextjs",
      version: "14.0.0"
    }
  }
};
```

---

## Development and Build Issues

### Issue: Build Failures After Generation

**Symptoms:**
```bash
# After project generation
npm run build
# TypeScript errors
# Missing dependencies
# Configuration errors
```

**Causes:**
- Missing dependencies
- TypeScript configuration issues
- Environment variable problems
- Service configuration conflicts

**Solutions:**

1. **Validate project after generation:**
```bash
xaheen validate --fix
```

2. **Install missing dependencies:**
```bash
npm install
# Or if peer dependencies missing
npm install --legacy-peer-deps
```

3. **Check TypeScript configuration:**
```bash
npx tsc --noEmit
# Fix any TypeScript errors
```

4. **Verify environment variables:**
```bash
cp .env.example .env.local
# Fill in required values
```

5. **Clean and rebuild:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Development Server Fails

**Symptoms:**
```bash
npm run dev
# Port already in use
# Module not found errors
# Configuration errors
```

**Causes:**
- Port conflicts
- Missing dependencies
- Environment issues
- Service configuration problems

**Solutions:**

1. **Check port availability:**
```bash
lsof -i :3000
# Kill process using port
kill -9 PID
```

2. **Use different port:**
```bash
PORT=3001 npm run dev
# Or modify package.json scripts
```

3. **Check service status:**
```bash
# For database services
docker ps
# For other services
systemctl status service-name
```

4. **Validate services:**
```bash
xaheen validate --services auth,database
xaheen validate --fix
```

---

## Support and Getting Help

### Getting Detailed Error Information

1. **Enable debug mode:**
```bash
XAHEEN_DEBUG=true xaheen create my-app --preset saas-starter --verbose
```

2. **Generate diagnostic report:**
```bash
xaheen doctor --report --output diagnostic-report.json
```

3. **Check system health:**
```bash
xaheen doctor --system --project
```

### Community Resources

1. **GitHub Issues:**
   - [Report bugs](https://github.com/Xala-Technologies/xaheen/issues)
   - [Feature requests](https://github.com/Xala-Technologies/xaheen/issues/new?template=feature_request.md)
   - [Search existing issues](https://github.com/Xala-Technologies/xaheen/issues)

2. **Documentation:**
   - [Complete documentation](https://xaheen.dev/docs)
   - [CLI v2 guide](https://xaheen.dev/docs/cli-v2)
   - [Commands reference](https://xaheen.dev/docs/cli-v2-commands)

3. **Community Support:**
   - [GitHub Discussions](https://github.com/Xala-Technologies/xaheen/discussions)
   - [Discord Community](https://discord.gg/xaheen)

### Professional Support

For enterprise customers:
- **Priority Support:** Dedicated support channels
- **Migration Assistance:** Professional v1 to v2 migration
- **Custom Solutions:** Tailored bundles and integrations
- **Training:** Team workshops and best practices

### Reporting Issues

When reporting issues, include:

1. **System Information:**
```bash
xaheen --version
node --version
npm --version
uname -a  # or system info
```

2. **Error Output:**
```bash
# Complete error message with stack trace
XAHEEN_DEBUG=true xaheen command --verbose 2>&1 | tee error.log
```

3. **Diagnostic Report:**
```bash
xaheen doctor --report --output diagnostic.json
```

4. **Project Configuration:**
```bash
# Include relevant config files (remove sensitive data)
cat package.json
cat xaheen.config.json
cat .env.example  # NOT .env.local
```

---

**Last Updated:** January 2025  
**Troubleshooting Version:** 2.0.2  
**Author:** Xala Technologies