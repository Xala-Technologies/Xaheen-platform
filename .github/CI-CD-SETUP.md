# 🚀 CI/CD Pipeline Setup Guide

This guide will help you set up and configure the comprehensive CI/CD pipeline for the Xaheen CLI project.

## 📋 Prerequisites

### Required Permissions
- Admin access to the GitHub repository
- Access to GitHub Packages
- Ability to create and manage GitHub Secrets
- Permission to create GitHub Environments

### Tool Requirements
- Node.js 18+
- Bun package manager
- GitHub CLI (optional, for easier setup)

## 🔧 Initial Setup

### 1. Repository Configuration

#### Enable GitHub Actions
1. Go to your repository settings
2. Navigate to **Actions** → **General**
3. Enable **Allow all actions and reusable workflows**
4. Set **Workflow permissions** to **Read and write permissions**

#### Configure GitHub Packages
1. Go to **Settings** → **Packages**
2. Enable package creation for the repository
3. Configure package visibility settings

### 2. Required Secrets Setup

Navigate to **Settings** → **Secrets and variables** → **Actions** and add:

#### Repository Secrets
```bash
# GitHub token for API access and package publishing
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Turborepo cache tokens (optional, for faster builds)
TURBO_TOKEN=your_turbo_token_here
TURBO_TEAM=your_turbo_team_here

# NPM token (optional, for NPM registry publishing)
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
```

#### Environment Variables (Optional)
```bash
# Node.js version (default: 18)
NODE_VERSION=18

# Custom registry URL
NPM_REGISTRY=https://npm.pkg.github.com
```

### 3. GitHub Environments Setup

#### Create Production Gate Environment
1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `production-gate`
4. Configure protection rules:
   - ✅ **Required reviewers** (add core maintainers)
   - ✅ **Wait timer**: 0 minutes
   - ✅ **Restrict branches**: `main` only

#### Create NPM Publish Environment
1. Create another environment: `npm-publish`
2. Configure protection rules:
   - ✅ **Required reviewers**
   - ✅ **Restrict branches**: `main` only
3. Add environment secrets if needed

### 4. Branch Protection Rules

#### Main Branch Protection
1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - Required status checks:
     - `📚 Documentation & Distribution`
     - `🧪 CLI Unit Tests (Coverage ≥ 90%)`
     - `🔗 Integration Tests Matrix`
     - `🚀 E2E Smoke Tests`
     - `🔒 Security & Compliance Scans`
   - ✅ **Restrict pushes that create files larger than 100MB**

## 🧪 Testing the Setup

### 1. Trigger Test Run
```bash
# Create a test branch
git checkout -b test-ci-setup

# Make a small change
echo "# CI/CD Test" >> TEST_CI.md
git add TEST_CI.md
git commit -m "test: trigger CI/CD pipeline"
git push origin test-ci-setup

# Create a pull request to main
gh pr create --title "Test CI/CD Setup" --body "Testing the CI/CD pipeline configuration"
```

### 2. Monitor Workflow Execution
1. Go to **Actions** tab in your repository
2. Watch the **Comprehensive Testing Pipeline** workflow
3. Verify all phases complete successfully

### 3. Validate Workflow Features

#### Check Matrix Builds
- Verify multiple framework/package manager combinations run
- Confirm parallel execution works correctly

#### Validate Caching
- Check build times improve on subsequent runs
- Verify cache hit rates in workflow logs

#### Test Security Scans
- Confirm dependency audits run
- Verify lint checks execute

#### Performance Benchmarks
- Check performance thresholds are enforced
- Verify regression detection works

## 🔍 Troubleshooting

### Common Issues

#### 🚨 "Permission denied" errors
**Solution:** Check that `GITHUB_TOKEN` has proper permissions:
- Repository: Read and Write
- Packages: Write
- Actions: Write

#### 🚨 Cache miss issues
**Solution:** Verify cache key patterns match your file structure:
- Check `bun.lockb` exists
- Verify `package.json` paths are correct

#### 🚨 Package publishing fails
**Solution:** Ensure packages have proper `publishConfig`:
```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://npm.pkg.github.com"
  }
}
```

#### 🚨 Tests timeout
**Solution:** Adjust timeout values in workflow files:
```yaml
timeout-minutes: 30  # Increase as needed
```

### Debug Commands

#### Local Testing
```bash
# Test CLI builds locally
cd packages/xaheen-cli
pnpm run build
node dist/index.js --version

# Test package creation
npm pack --dry-run

# Run tests with verbose output
pnpm test --verbose
```

#### Workflow Debugging
```bash
# Enable debug logging in workflows
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## 📊 Monitoring & Maintenance

### Weekly Tasks
- [ ] Review failed builds and address issues
- [ ] Check dependency security alerts
- [ ] Monitor performance trends

### Monthly Tasks
- [ ] Update workflow dependencies (actions versions)
- [ ] Review and optimize cache strategies
- [ ] Analyze build performance metrics

### Quarterly Tasks
- [ ] Comprehensive security audit
- [ ] Review and update performance thresholds
- [ ] Evaluate new GitHub Actions features

## 🎯 Customization

### Adjusting Performance Thresholds
Edit `.github/workflows/comprehensive-tests.yml`:
```yaml
# Current thresholds
if [ $dry_run_time -gt 500 ]; then    # 500ms for dry-run
if [ $full_time -gt 2000 ]; then     # 2s for full scaffold
```

### Adding New Framework Support
1. Update matrix strategy:
```yaml
matrix:
  framework: [nextjs, react, vue, angular, svelte, your-new-framework]
```

2. Add framework-specific test logic
3. Update documentation

### Custom Compliance Rules
Add custom checks in the compliance phase:
```yaml
- name: Custom compliance validation
  run: |
    # Your custom compliance logic here
    echo "Running custom compliance checks..."
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Bun Documentation](https://bun.sh/docs)

## 🆘 Support

If you encounter issues:

1. **Check existing documentation** in `.github/workflows/README.md`
2. **Search GitHub Issues** for similar problems
3. **Create a new issue** using the CI/CD issue template
4. **Contact the DevOps team** for urgent pipeline issues

---

## ✅ Setup Checklist

- [ ] GitHub Actions enabled
- [ ] Required secrets configured
- [ ] Environments created with protection rules
- [ ] Branch protection rules set up
- [ ] Test workflow execution successful
- [ ] All pipeline phases working
- [ ] Performance thresholds appropriate
- [ ] Security scans configured
- [ ] Monitoring and alerting set up

**Congratulations! Your comprehensive CI/CD pipeline is now ready! 🎉**