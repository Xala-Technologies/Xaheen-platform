# Xala CLI Troubleshooting Guide

Comprehensive troubleshooting guide for common issues, solutions, and debugging techniques.

## Quick Diagnostic Commands

```bash
# Check CLI version and environment
xala --version
xala config info

# Validate project configuration
xala config validate

# Run comprehensive diagnostics
xala analyze --performance --accessibility --compliance

# Check system requirements
xala doctor

# Enable debug logging
DEBUG=true xala [command]
```

## Installation Issues

### Node.js Version Incompatibility

**Problem:** CLI fails to install or run due to Node.js version.

```bash
Error: The engine "node" is incompatible with this module.
Expected version ">=18.0.0". Got "16.14.0"
```

**Solution:**
1. Update Node.js to version 18 or higher:
   ```bash
   # Using nvm
   nvm install 18
   nvm use 18
   
   # Using Homebrew (macOS)
   brew install node@18
   brew link node@18
   
   # Verify version
   node --version
   ```

2. If you must use an older Node.js version, use the compatibility build:
   ```bash
   npm install -g @xala-technologies/xala-cli@compat
   ```

### NPM Permission Issues

**Problem:** Permission denied errors during global installation.

```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solutions:**

1. **Use npx (Recommended):**
   ```bash
   npx @xala-technologies/xala-cli init my-project
   ```

2. **Configure npm prefix:**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   npm install -g @xala-technologies/xala-cli
   ```

3. **Use node version manager:**
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install and use latest Node.js
   nvm install node
   nvm use node
   npm install -g @xala-technologies/xala-cli
   ```

### Package Registry Issues

**Problem:** Unable to fetch packages from registry.

```bash
Error: Unable to resolve dependency: @xala-technologies/ui-system
```

**Solutions:**

1. **Check registry configuration:**
   ```bash
   npm config get registry
   npm config set registry https://registry.npmjs.org/
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use alternative registry:**
   ```bash
   npm install -g @xala-technologies/xala-cli --registry https://registry.yarnpkg.com
   ```

## Project Initialization Issues

### Template Not Found

**Problem:** Specified template doesn't exist.

```bash
Error: Template 'custom-healthcare' not found
Available templates: saas, healthcare, finance, ecommerce, education
```

**Solution:**
1. List available templates:
   ```bash
   xala templates list
   ```

2. Use correct template name:
   ```bash
   xala init my-project --template healthcare
   ```

3. Create custom template if needed:
   ```bash
   xala templates create custom-healthcare --base healthcare
   ```

### Configuration File Errors

**Problem:** Invalid configuration file format.

```bash
Error: Invalid configuration file: xala.config.js
SyntaxError: Unexpected token 'export'
```

**Solutions:**

1. **Use CommonJS format:**
   ```javascript
   // xala.config.js
   module.exports = {
     name: 'my-project',
     platform: 'react',
     // ... other options
   };
   ```

2. **Validate configuration:**
   ```bash
   xala config validate
   ```

3. **Reset to default configuration:**
   ```bash
   xala config reset --confirm
   ```

### Directory Already Exists

**Problem:** Target directory is not empty.

```bash
Error: Directory 'my-project' already exists and is not empty
```

**Solutions:**

1. **Use different directory name:**
   ```bash
   xala init my-project-v2 --platform react
   ```

2. **Force overwrite (careful!):**
   ```bash
   xala init my-project --platform react --force
   ```

3. **Initialize in existing directory:**
   ```bash
   cd existing-project
   xala init . --platform react
   ```

## AI Integration Issues

### API Key Problems

**Problem:** AI features not working due to missing or invalid API key.

```bash
Error: OpenAI API key not found or invalid
```

**Solutions:**

1. **Set API key as environment variable:**
   ```bash
   # For OpenAI
   export OPENAI_API_KEY="your-api-key-here"
   
   # For Anthropic
   export ANTHROPIC_API_KEY="your-api-key-here"
   
   # Verify it's set
   echo $OPENAI_API_KEY
   ```

2. **Set in shell profile:**
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.profile
   echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Use configuration file:**
   ```javascript
   // xala.config.js
   module.exports = {
     ai: {
       provider: 'openai',
       apiKey: process.env.OPENAI_API_KEY
     }
   };
   ```

### Rate Limiting

**Problem:** AI provider rate limits exceeded.

```bash
Error: Rate limit exceeded. Please try again later.
```

**Solutions:**

1. **Wait and retry:**
   ```bash
   # Wait 60 seconds then retry
   sleep 60 && xala ai generate "user dashboard"
   ```

2. **Use different provider:**
   ```bash
   xala ai generate "user dashboard" --provider anthropic
   ```

3. **Reduce complexity:**
   ```bash
   xala ai generate "simple user card" --complexity basic
   ```

### Network Connection Issues

**Problem:** Cannot connect to AI provider.

```bash
Error: Network timeout connecting to OpenAI API
```

**Solutions:**

1. **Check internet connection:**
   ```bash
   ping google.com
   curl -I https://api.openai.com/v1/models
   ```

2. **Configure proxy if needed:**
   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

3. **Use offline mode:**
   ```bash
   xala create component UserCard --offline
   ```

## Build Issues

### TypeScript Compilation Errors

**Problem:** TypeScript compilation fails during build.

```bash
Error: TS2304: Cannot find name 'JSX'
```

**Solutions:**

1. **Check TypeScript configuration:**
   ```bash
   # Validate tsconfig.json
   npx tsc --noEmit
   
   # Reset TypeScript config
   xala config typescript --reset
   ```

2. **Install missing type definitions:**
   ```bash
   npm install --save-dev @types/react @types/react-dom
   ```

3. **Update TypeScript version:**
   ```bash
   npm install --save-dev typescript@latest
   ```

### Missing Dependencies

**Problem:** Build fails due to missing dependencies.

```bash
Error: Cannot resolve module '@xala-technologies/ui-system'
```

**Solutions:**

1. **Install missing dependencies:**
   ```bash
   npm install @xala-technologies/ui-system
   ```

2. **Update all dependencies:**
   ```bash
   npm update
   ```

3. **Reinstall all dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Platform-Specific Build Errors

**Problem:** Build fails for specific platform.

```bash
Error: Flutter build failed: SDK not found
```

**Solutions:**

1. **Install platform SDK:**
   ```bash
   # Flutter
   flutter doctor
   flutter pub get
   
   # iOS (macOS only)
   xcode-select --install
   
   # Android
   # Install Android Studio and SDK
   ```

2. **Skip problematic platforms:**
   ```bash
   xala build react vue angular --skip flutter ios android
   ```

3. **Use platform-specific commands:**
   ```bash
   xala build react --only
   ```

## Development Server Issues

### Port Already in Use

**Problem:** Development server can't start due to port conflict.

```bash
Error: Port 3000 is already in use
```

**Solutions:**

1. **Use different port:**
   ```bash
   xala dev --port 3001
   ```

2. **Kill process using port:**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Use automatic port selection:**
   ```bash
   xala dev --port auto
   ```

### HTTPS Certificate Issues

**Problem:** HTTPS development server fails to start.

```bash
Error: Unable to generate self-signed certificate
```

**Solutions:**

1. **Install certificate dependencies:**
   ```bash
   # macOS
   brew install mkcert
   mkcert -install
   
   # Ubuntu/Debian
   sudo apt install mkcert
   mkcert -install
   ```

2. **Use HTTP instead:**
   ```bash
   xala dev --no-https
   ```

3. **Generate certificate manually:**
   ```bash
   mkcert localhost 127.0.0.1
   xala dev --cert localhost.pem --key localhost-key.pem
   ```

### Hot Reload Not Working

**Problem:** Changes not reflected in browser.

**Solutions:**

1. **Check file watching:**
   ```bash
   # Increase file watchers limit (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Force reload:**
   ```bash
   # Trigger manual reload
   xala dev --force-reload
   ```

3. **Clear cache:**
   ```bash
   # Clear browser cache and restart server
   xala dev --no-cache
   ```

## Theme and Token Issues

### Theme Not Found

**Problem:** Specified theme doesn't exist.

```bash
Error: Theme 'custom-medical' not found
```

**Solutions:**

1. **List available themes:**
   ```bash
   xala themes list
   ```

2. **Create missing theme:**
   ```bash
   xala themes create custom-medical --industry healthcare
   ```

3. **Use default theme temporarily:**
   ```bash
   xala dev --theme default
   ```

### Token Generation Failures

**Problem:** Design tokens fail to generate.

```bash
Error: Failed to generate tokens for platform 'ios'
```

**Solutions:**

1. **Generate for specific platforms:**
   ```bash
   xala tokens generate --platform react vue
   ```

2. **Check token source:**
   ```bash
   xala tokens validate --verbose
   ```

3. **Reset tokens:**
   ```bash
   xala tokens reset --confirm
   ```

### Color Contrast Issues

**Problem:** Generated colors don't meet accessibility standards.

```bash
Warning: Color contrast ratio 2.1:1 is below WCAG AAA requirement (7:1)
```

**Solutions:**

1. **Adjust color values:**
   ```bash
   xala themes customize my-theme --colors primary=#0066cc,secondary=#004499
   ```

2. **Use high contrast mode:**
   ```bash
   xala themes create my-theme --accessibility AAA --high-contrast
   ```

3. **Validate colors:**
   ```bash
   xala analyze --accessibility --detailed
   ```

## Component Generation Issues

### Invalid Component Names

**Problem:** Component name doesn't follow naming conventions.

```bash
Error: Component name 'user-card-123' is invalid
```

**Solutions:**

1. **Use valid naming:**
   ```bash
   # Valid names
   xala create component UserCard
   xala create component DataTable
   xala create component NavigationMenu
   ```

2. **Check naming rules:**
   ```bash
   xala help naming-conventions
   ```

### Missing Props Definition

**Problem:** Generated component has no props interface.

```bash
Warning: Component generated without props interface
```

**Solutions:**

1. **Specify props:**
   ```bash
   xala create component UserCard --props "name:string,email:string,avatar:string"
   ```

2. **Use interactive mode:**
   ```bash
   xala create component UserCard --interactive
   ```

### Template Rendering Errors

**Problem:** Template fails to render properly.

```bash
Error: Template rendering failed: Missing required context variable 'componentName'
```

**Solutions:**

1. **Validate template:**
   ```bash
   xala templates validate
   ```

2. **Debug template rendering:**
   ```bash
   DEBUG=true xala create component UserCard
   ```

3. **Reset templates:**
   ```bash
   xala templates reset --confirm
   ```

## Performance Issues

### Slow Build Times

**Problem:** Build process takes too long.

**Solutions:**

1. **Enable build cache:**
   ```bash
   xala build --cache
   ```

2. **Use incremental builds:**
   ```bash
   xala build --incremental
   ```

3. **Optimize bundle analysis:**
   ```bash
   xala build --analyze --output-analysis ./build-analysis
   ```

### Memory Issues

**Problem:** CLI runs out of memory during large operations.

```bash
Error: JavaScript heap out of memory
```

**Solutions:**

1. **Increase Node.js memory limit:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   xala build all
   ```

2. **Build platforms separately:**
   ```bash
   xala build react
   xala build vue
   xala build angular
   ```

3. **Use streaming mode:**
   ```bash
   xala build --stream
   ```

## Compliance Issues

### Norwegian Standards Validation

**Problem:** Code doesn't meet NSM compliance requirements.

```bash
Error: NSM compliance validation failed
- Found 'any' type usage (forbidden)
- Missing i18n for user-facing text
- Non-semantic HTML elements detected
```

**Solutions:**

1. **Fix type issues:**
   ```typescript
   // Instead of 'any'
   interface UserData {
     name: string;
     email: string;
   }
   ```

2. **Add internationalization:**
   ```typescript
   // Use t() function for all text
   <Text>{t('user.welcome')}</Text>
   ```

3. **Use semantic components:**
   ```typescript
   // Instead of <div>
   <Container>
     <Text>Content</Text>
   </Container>
   ```

### WCAG Accessibility Violations

**Problem:** Generated code fails accessibility validation.

```bash
Error: WCAG AAA violations found
- Missing aria-label attributes
- Insufficient color contrast
- No keyboard navigation support
```

**Solutions:**

1. **Add accessibility attributes:**
   ```typescript
   <Button
     aria-label={t('actions.submit')}
     role="button"
     tabIndex={0}
   >
     {t('buttons.submit')}
   </Button>
   ```

2. **Fix color contrast:**
   ```bash
   xala themes customize my-theme --high-contrast
   ```

3. **Enable keyboard navigation:**
   ```typescript
   <Container
     onKeyDown={handleKeyDown}
     tabIndex={0}
   >
   ```

## Debugging Techniques

### Enable Debug Mode

```bash
# Enable debug logging for all operations
export DEBUG=xala:*
xala create component UserCard

# Enable debug for specific modules
export DEBUG=xala:ai,xala:templates
xala ai generate "user dashboard"

# Enable verbose output
xala build --verbose
```

### Inspect Generated Files

```bash
# Show generated files without writing to disk
xala create component UserCard --dry-run

# Generate with detailed output
xala create component UserCard --verbose --debug

# Show template context
xala templates debug ./templates/react/component.tsx.hbs
```

### Performance Profiling

```bash
# Profile build performance
xala build --profile --output-profile ./build-profile.json

# Analyze bundle performance
xala analyze --performance --detailed --output ./performance-report.html

# Memory usage analysis
xala build --memory-profile
```

### Network Debugging

```bash
# Debug AI API calls
DEBUG=axios xala ai generate "user form"

# Test network connectivity
xala doctor --network

# Use proxy for debugging
export HTTP_PROXY=http://localhost:8888
export HTTPS_PROXY=http://localhost:8888
xala ai generate "user card"
```

## Common Error Patterns

### Error Code Reference

| Code | Category | Description |
|------|----------|-------------|
| 1 | General | Unexpected error |
| 2 | Validation | Input validation failed |
| 3 | Configuration | Configuration error |
| 4 | Build | Build process failed |
| 5 | Network | Network connectivity issue |
| 6 | Templates | Template processing error |
| 7 | AI | AI service error |
| 8 | Compliance | Compliance validation failed |

### Error Messages and Solutions

**"Command not found: xala"**
- Install CLI globally: `npm install -g @xala-technologies/xala-cli`
- Use npx: `npx @xala-technologies/xala-cli`

**"Configuration file not found"**
- Create config: `xala config init`
- Specify config path: `xala --config ./custom.config.js`

**"Platform not supported"**
- Check available platforms: `xala platforms list`
- Use supported platform: `react`, `vue`, `angular`, `flutter`

**"Theme validation failed"**
- Validate theme: `xala themes validate my-theme`
- Reset theme: `xala themes reset my-theme`

**"Component name already exists"**
- Use different name: `xala create component UserCardV2`
- Force overwrite: `xala create component UserCard --force`

## Getting Help

### CLI Help Commands

```bash
# General help
xala --help

# Command-specific help
xala create --help
xala build --help

# Get examples
xala examples component
xala examples theme

# Show documentation
xala docs component-development
xala docs accessibility
```

### Diagnostic Information

```bash
# System information
xala doctor

# Environment check
xala config info

# Version information
xala --version
npm list -g @xala-technologies/xala-cli
```

### Log Files

```bash
# Default log locations
# macOS/Linux: ~/.xala/logs/
# Windows: %APPDATA%\xala\logs\

# View recent logs
tail -f ~/.xala/logs/xala.log

# Debug logs
tail -f ~/.xala/logs/debug.log
```

### Community Resources

- **Documentation**: https://xala.dev/docs
- **GitHub Issues**: https://github.com/xala-technologies/xala-cli/issues
- **Discord Community**: https://discord.gg/xala
- **Stack Overflow**: Tag questions with `xala-cli`

### Reporting Bugs

When reporting bugs, include:

1. **System Information:**
   ```bash
   xala doctor --verbose
   ```

2. **Error Logs:**
   ```bash
   DEBUG=xala:* xala [failing-command] 2>&1 | tee error.log
   ```

3. **Configuration:**
   ```bash
   cat xala.config.js
   ```

4. **Minimal Reproduction:**
   ```bash
   # Steps to reproduce the issue
   xala init test-project --platform react
   cd test-project
   xala create component FailingComponent
   ```

5. **Expected vs Actual Behavior**

### Emergency Recovery

**Reset Everything:**
```bash
# Remove all CLI data
rm -rf ~/.xala

# Clear npm cache
npm cache clean --force

# Reinstall CLI
npm uninstall -g @xala-technologies/xala-cli
npm install -g @xala-technologies/xala-cli

# Verify installation
xala --version
xala doctor
```

**Project Recovery:**
```bash
# Reset project configuration
xala config reset --confirm

# Regenerate templates
xala templates reset --confirm

# Rebuild from scratch
rm -rf node_modules package-lock.json
npm install
xala build --clean
```