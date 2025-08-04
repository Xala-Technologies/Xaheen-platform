# Publishing Guide for Xala UI System MCP Server

This guide provides step-by-step instructions for publishing the Xala UI System MCP Server to various platforms and distribution channels.

## 📋 Pre-Publishing Checklist

### **1. Code Quality**
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatting is consistent (`npm run format:check`)
- [ ] Test coverage is ≥95% (`npm run test:coverage`)

### **2. Documentation**
- [ ] README.md is up to date
- [ ] CHANGELOG.md includes all changes
- [ ] API documentation is complete
- [ ] Examples are working and tested
- [ ] Migration guides are provided (if needed)

### **3. Version Management**
- [ ] Version number follows semantic versioning
- [ ] Git tags are created for releases
- [ ] Breaking changes are documented
- [ ] Dependencies are up to date

### **4. Build Verification**
- [ ] Production build succeeds (`npm run build`)
- [ ] Generated files are correct
- [ ] Bundle size is acceptable
- [ ] No development dependencies in production build

## 🚀 Publishing to NPM

### **Step 1: Prepare for Publishing**

```bash
# 1. Ensure you're on the main branch
git checkout main
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run full validation
npm run validate

# 4. Build the project
npm run build
```

### **Step 2: Version Bump**

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major

# Or set specific version
npm version 1.2.3
```

### **Step 3: Publish to NPM**

```bash
# Login to NPM (first time only)
npm login

# Publish the package
npm publish

# Or publish with specific tag
npm publish --tag beta
npm publish --tag latest
```

### **Step 4: Verify Publication**

```bash
# Check package on NPM
npm view @xala-technologies/ui-system-mcp

# Test installation
npm install -g @xala-technologies/ui-system-mcp
xala-ui-mcp --version
```

## 🐳 Publishing to Docker Hub

### **Step 1: Build Docker Image**

```bash
# Build for multiple platforms
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t xalatechnologies/ui-system-mcp:latest \
  -t xalatechnologies/ui-system-mcp:v1.0.0 \
  --push .
```

### **Step 2: Test Docker Image**

```bash
# Test locally
docker run -p 3000:3000 xalatechnologies/ui-system-mcp:latest

# Test health check
curl http://localhost:3000/health
```

### **Step 3: Push to Docker Hub**

```bash
# Login to Docker Hub
docker login

# Push images
docker push xalatechnologies/ui-system-mcp:latest
docker push xalatechnologies/ui-system-mcp:v1.0.0
```

## 📱 VS Code Extension Publishing

### **Step 1: Create Extension Structure**

```bash
# Create extension directory
mkdir vscode-extension
cd vscode-extension

# Initialize extension
npm init -y
```

### **Step 2: Create Extension Manifest**

```json
// package.json for VS Code extension
{
  "name": "xala-ui-system-mcp",
  "displayName": "Xala UI System MCP",
  "description": "Generate React components using Xala UI System",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onCommand:xala-ui-mcp.generateComponent"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "xala-ui-mcp.generateComponent",
        "title": "Generate Component",
        "category": "Xala UI"
      }
    ]
  }
}
```

### **Step 3: Publish Extension**

```bash
# Install vsce
npm install -g vsce

# Package extension
vsce package

# Publish to marketplace
vsce publish
```

## 🔄 Automated Publishing with GitHub Actions

### **Step 1: Set Up Secrets**

Add these secrets to your GitHub repository:

- `NPM_TOKEN`: NPM authentication token
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password

### **Step 2: Create Release**

```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0

# Or create release via GitHub CLI
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release"
```

### **Step 3: Monitor Deployment**

- Check GitHub Actions workflow
- Verify NPM package publication
- Confirm Docker image availability
- Test installations

## 📊 Distribution Channels

### **1. NPM Registry**
- **URL**: https://www.npmjs.com/package/@xala-technologies/ui-system-mcp
- **Installation**: `npm install -g @xala-technologies/ui-system-mcp`
- **Usage**: Global CLI tool

### **2. Docker Hub**
- **URL**: https://hub.docker.com/r/xalatechnologies/ui-system-mcp
- **Installation**: `docker pull xalatechnologies/ui-system-mcp`
- **Usage**: Containerized server

### **3. GitHub Releases**
- **URL**: https://github.com/xala-technologies/ui-system-mcp/releases
- **Installation**: Download binary releases
- **Usage**: Direct executable

### **4. VS Code Marketplace**
- **URL**: https://marketplace.visualstudio.com/items?itemName=xala-technologies.ui-system-mcp
- **Installation**: Install from VS Code extensions
- **Usage**: Integrated development experience

### **5. Windsurf MCP Registry**
- **Configuration**: Add to MCP servers list
- **Installation**: Automatic via MCP protocol
- **Usage**: AI-assisted development

## 🔧 Platform-Specific Instructions

### **NPM Package**

```bash
# Global installation
npm install -g @xala-technologies/ui-system-mcp

# Project dependency
npm install --save-dev @xala-technologies/ui-system-mcp

# Usage
xala-ui-mcp generate component --name UserCard
```

### **Docker Container**

```bash
# Run server
docker run -p 3000:3000 xalatechnologies/ui-system-mcp

# With environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  xalatechnologies/ui-system-mcp

# Docker Compose
version: '3.8'
services:
  mcp-server:
    image: xalatechnologies/ui-system-mcp:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

### **Windsurf Integration**

```json
// Add to Windsurf MCP configuration
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "npx",
      "args": ["@xala-technologies/ui-system-mcp"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Claude Desktop Integration**

```json
// Add to Claude Desktop MCP config
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "node",
      "args": ["/path/to/xala-ui-system-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 📈 Post-Publishing Tasks

### **1. Verification**
- [ ] Test installation from all channels
- [ ] Verify functionality in different environments
- [ ] Check documentation links
- [ ] Confirm version numbers are correct

### **2. Communication**
- [ ] Update project README with new version
- [ ] Announce release on social media
- [ ] Notify community in Discord/forums
- [ ] Send release notes to subscribers

### **3. Monitoring**
- [ ] Monitor download statistics
- [ ] Track error reports
- [ ] Review user feedback
- [ ] Monitor performance metrics

### **4. Documentation Updates**
- [ ] Update installation instructions
- [ ] Refresh examples and tutorials
- [ ] Update API documentation
- [ ] Create migration guides if needed

## 🐛 Troubleshooting Publishing Issues

### **NPM Publishing Errors**

```bash
# Authentication issues
npm logout
npm login

# Permission errors
npm whoami
npm access list packages

# Version conflicts
npm view @xala-technologies/ui-system-mcp versions --json
```

### **Docker Build Issues**

```bash
# Clear build cache
docker builder prune

# Debug build process
docker build --no-cache --progress=plain .

# Check image size
docker images xalatechnologies/ui-system-mcp
```

### **GitHub Actions Failures**

```bash
# Check workflow logs
gh run list
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id>
```

## 📊 Release Metrics

### **Success Criteria**
- [ ] NPM package published successfully
- [ ] Docker image available on Docker Hub
- [ ] GitHub release created with assets
- [ ] VS Code extension published (if applicable)
- [ ] Documentation updated
- [ ] No critical issues reported within 24 hours

### **Monitoring**
- **Download counts**: Track NPM and Docker pulls
- **Error rates**: Monitor error reporting
- **User feedback**: Review issues and discussions
- **Performance**: Check server response times

## 🔄 Rollback Procedures

### **NPM Rollback**
```bash
# Unpublish specific version (within 72 hours)
npm unpublish @xala-technologies/ui-system-mcp@1.0.1

# Deprecate version
npm deprecate @xala-technologies/ui-system-mcp@1.0.1 "Use version 1.0.0 instead"
```

### **Docker Rollback**
```bash
# Remove problematic tag
docker rmi xalatechnologies/ui-system-mcp:1.0.1

# Retag previous version as latest
docker tag xalatechnologies/ui-system-mcp:1.0.0 xalatechnologies/ui-system-mcp:latest
docker push xalatechnologies/ui-system-mcp:latest
```

### **GitHub Release Rollback**
```bash
# Delete release
gh release delete v1.0.1

# Delete tag
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
```

---

## 📞 Support

For publishing support:
- **Email**: support@xala.no
- **GitHub Issues**: https://github.com/xala-technologies/ui-system-mcp/issues
- **Discord**: https://discord.gg/xala-technologies

**Remember**: Always test thoroughly before publishing, and have a rollback plan ready!
