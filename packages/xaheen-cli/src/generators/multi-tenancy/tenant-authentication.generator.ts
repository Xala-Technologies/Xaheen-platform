import { BaseGenerator } from '../base.generator';
import { TenantAuthenticationOptions, GenerationResult } from './types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

/**
 * Tenant Authentication Generator
 * Generates comprehensive tenant-aware authentication systems with multi-factor
 * authentication, session management, and federated identity support.
 */
export class TenantAuthenticationGenerator extends BaseGenerator<TenantAuthenticationOptions> {
  async generate(options: TenantAuthenticationOptions): Promise<GenerationResult> {
    try {
      await this.validateOptions(options);
      this.logger.info(`Generating Tenant Authentication System: ${options.name}`);

      const result: GenerationResult = {
        files: [],
        commands: [],
        nextSteps: []
      };

      // Create tenant authentication structure
      await this.createAuthenticationStructure(options, result);
      
      // Generate authentication providers
      await this.generateAuthenticationProviders(options, result);
      
      // Generate multi-factor authentication
      await this.generateMultiFactorAuth(options, result);
      
      // Generate session management
      await this.generateSessionManagement(options, result);
      
      // Generate single sign-on
      await this.generateSingleSignOn(options, result);
      
      // Generate federated identity
      await this.generateFederatedIdentity(options, result);
      
      // Generate authentication middleware
      await this.generateAuthenticationMiddleware(options, result);
      
      // Generate security features
      await this.generateSecurityFeatures(options, result);
      
      // Generate configuration files
      await this.generateConfigurations(options, result);

      this.logger.success(`Tenant Authentication System generated successfully: ${options.name}`);
      return result;

    } catch (error: any) {
      this.logger.error(`Failed to generate Tenant Authentication System: ${error.message}`, error);
      throw error;
    }
  }

  private async createAuthenticationStructure(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), 'tenant-auth');
    
    // Create directory structure
    const directories = [
      'src/auth/providers',
      'src/auth/strategies',
      'src/auth/guards',
      'src/auth/middleware',
      'src/auth/services',
      'src/auth/controllers',
      'src/auth/dto',
      'src/mfa/services',
      'src/mfa/providers',
      'src/session/services',
      'src/session/stores',
      'src/sso/services',
      'src/sso/providers',
      'src/federation/services',
      'src/federation/providers',
      'src/security/services',
      'src/security/validators',
      'config/auth',
      'migrations/auth',
      'tests/auth'
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.join(baseDir, dir));
    }

    // Generate main authentication module
    const moduleTemplate = await this.loadTemplate('tenant-auth/auth.module.ts.hbs');
    const moduleContent = moduleTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const modulePath = path.join(baseDir, 'src/auth/TenantAuthModule.ts');
    await fs.writeFile(modulePath, moduleContent);
    result.files.push(modulePath);
  }

  private async generateAuthenticationProviders(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate base authentication service
    const authServiceTemplate = await this.loadTemplate('tenant-auth/services/tenant-auth.service.ts.hbs');
    const authServiceContent = authServiceTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const authServicePath = path.join(baseDir, 'src/auth/services/TenantAuthService.ts');
    await fs.writeFile(authServicePath, authServiceContent);
    result.files.push(authServicePath);

    // Generate provider-specific implementations
    switch (options.provider) {
      case 'jwt':
        await this.generateJWTProvider(options, baseDir, result);
        break;
      case 'oauth':
        await this.generateOAuthProvider(options, baseDir, result);
        break;
      case 'saml':
        await this.generateSAMLProvider(options, baseDir, result);
        break;
      case 'oidc':
        await this.generateOIDCProvider(options, baseDir, result);
        break;
      case 'bankid':
        await this.generateBankIDProvider(options, baseDir, result);
        break;
    }

    // Generate authentication controller
    const controllerTemplate = await this.loadTemplate('tenant-auth/controllers/auth.controller.ts.hbs');
    const controllerContent = controllerTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const controllerPath = path.join(baseDir, 'src/auth/controllers/AuthController.ts');
    await fs.writeFile(controllerPath, controllerContent);
    result.files.push(controllerPath);
  }

  private async generateJWTProvider(
    options: TenantAuthenticationOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    const jwtTemplate = await this.loadTemplate('tenant-auth/providers/jwt.provider.ts.hbs');
    const jwtContent = jwtTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const jwtPath = path.join(baseDir, 'src/auth/providers/JWTProvider.ts');
    await fs.writeFile(jwtPath, jwtContent);
    result.files.push(jwtPath);

    result.commands.push('npm install @nestjs/jwt @nestjs/passport passport passport-jwt');
  }

  private async generateOAuthProvider(
    options: TenantAuthenticationOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    const oauthTemplate = await this.loadTemplate('tenant-auth/providers/oauth.provider.ts.hbs');
    const oauthContent = oauthTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const oauthPath = path.join(baseDir, 'src/auth/providers/OAuthProvider.ts');
    await fs.writeFile(oauthPath, oauthContent);
    result.files.push(oauthPath);

    result.commands.push('npm install passport-oauth2 passport-google-oauth20 passport-github2');
  }

  private async generateSAMLProvider(
    options: TenantAuthenticationOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    const samlTemplate = await this.loadTemplate('tenant-auth/providers/saml.provider.ts.hbs');
    const samlContent = samlTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const samlPath = path.join(baseDir, 'src/auth/providers/SAMLProvider.ts');
    await fs.writeFile(samlPath, samlContent);
    result.files.push(samlPath);

    result.commands.push('npm install passport-saml saml2-js');
  }

  private async generateOIDCProvider(
    options: TenantAuthenticationOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    const oidcTemplate = await this.loadTemplate('tenant-auth/providers/oidc.provider.ts.hbs');
    const oidcContent = oidcTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const oidcPath = path.join(baseDir, 'src/auth/providers/OIDCProvider.ts');
    await fs.writeFile(oidcPath, oidcContent);
    result.files.push(oidcPath);

    result.commands.push('npm install openid-client passport-openidconnect');
  }

  private async generateBankIDProvider(
    options: TenantAuthenticationOptions,
    baseDir: string,
    result: GenerationResult
  ): Promise<void> {
    const bankidTemplate = await this.loadTemplate('tenant-auth/providers/bankid.provider.ts.hbs');
    const bankidContent = bankidTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const bankidPath = path.join(baseDir, 'src/auth/providers/BankIDProvider.ts');
    await fs.writeFile(bankidPath, bankidContent);
    result.files.push(bankidPath);

    result.commands.push('npm install @nestjs/axios');
  }

  private async generateMultiFactorAuth(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.multiFactorAuth) return;

    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate MFA service
    const mfaServiceTemplate = await this.loadTemplate('tenant-auth/mfa/mfa.service.ts.hbs');
    const mfaServiceContent = mfaServiceTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const mfaServicePath = path.join(baseDir, 'src/mfa/services/MFAService.ts');
    await fs.writeFile(mfaServicePath, mfaServiceContent);
    result.files.push(mfaServicePath);

    // Generate TOTP provider
    const totpTemplate = await this.loadTemplate('tenant-auth/mfa/totp.provider.ts.hbs');
    const totpContent = totpTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const totpPath = path.join(baseDir, 'src/mfa/providers/TOTPProvider.ts');
    await fs.writeFile(totpPath, totpContent);
    result.files.push(totpPath);

    // Generate SMS provider
    const smsTemplate = await this.loadTemplate('tenant-auth/mfa/sms.provider.ts.hbs');
    const smsContent = smsTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const smsPath = path.join(baseDir, 'src/mfa/providers/SMSProvider.ts');
    await fs.writeFile(smsPath, smsContent);
    result.files.push(smsPath);

    result.commands.push('npm install speakeasy qrcode twilio');
  }

  private async generateSessionManagement(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate session service
    const sessionServiceTemplate = await this.loadTemplate('tenant-auth/session/session.service.ts.hbs');
    const sessionServiceContent = sessionServiceTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const sessionServicePath = path.join(baseDir, 'src/session/services/SessionService.ts');
    await fs.writeFile(sessionServicePath, sessionServiceContent);
    result.files.push(sessionServicePath);

    // Generate session store based on management type
    if (options.sessionManagement === 'stateful') {
      const storeTemplate = await this.loadTemplate('tenant-auth/session/redis-session.store.ts.hbs');
      const storeContent = storeTemplate({
        ...options,
        timestamp: new Date().toISOString()
      });

      const storePath = path.join(baseDir, 'src/session/stores/RedisSessionStore.ts');
      await fs.writeFile(storePath, storeContent);
      result.files.push(storePath);

      result.commands.push('npm install redis connect-redis express-session');
    }
  }

  private async generateSingleSignOn(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.singleSignOn) return;

    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate SSO service
    const ssoServiceTemplate = await this.loadTemplate('tenant-auth/sso/sso.service.ts.hbs');
    const ssoServiceContent = ssoServiceTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const ssoServicePath = path.join(baseDir, 'src/sso/services/SSOService.ts');
    await fs.writeFile(ssoServicePath, ssoServiceContent);
    result.files.push(ssoServicePath);

    // Generate SSO provider
    const ssoProviderTemplate = await this.loadTemplate('tenant-auth/sso/sso.provider.ts.hbs');
    const ssoProviderContent = ssoProviderTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const ssoProviderPath = path.join(baseDir, 'src/sso/providers/SSOProvider.ts');
    await fs.writeFile(ssoProviderPath, ssoProviderContent);
    result.files.push(ssoProviderPath);
  }

  private async generateFederatedIdentity(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    if (!options.federatedIdentity) return;

    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate federation service
    const federationTemplate = await this.loadTemplate('tenant-auth/federation/federation.service.ts.hbs');
    const federationContent = federationTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const federationPath = path.join(baseDir, 'src/federation/services/FederationService.ts');
    await fs.writeFile(federationPath, federationContent);
    result.files.push(federationPath);
  }

  private async generateAuthenticationMiddleware(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate tenant authentication middleware
    const middlewareTemplate = await this.loadTemplate('tenant-auth/middleware/tenant-auth.middleware.ts.hbs');
    const middlewareContent = middlewareTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const middlewarePath = path.join(baseDir, 'src/auth/middleware/TenantAuthMiddleware.ts');
    await fs.writeFile(middlewarePath, middlewareContent);
    result.files.push(middlewarePath);

    // Generate authentication guard
    const guardTemplate = await this.loadTemplate('tenant-auth/guards/tenant-auth.guard.ts.hbs');
    const guardContent = guardTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const guardPath = path.join(baseDir, 'src/auth/guards/TenantAuthGuard.ts');
    await fs.writeFile(guardPath, guardContent);
    result.files.push(guardPath);
  }

  private async generateSecurityFeatures(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate security service
    const securityTemplate = await this.loadTemplate('tenant-auth/security/auth-security.service.ts.hbs');
    const securityContent = securityTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const securityPath = path.join(baseDir, 'src/security/services/AuthSecurityService.ts');
    await fs.writeFile(securityPath, securityContent);
    result.files.push(securityPath);

    // Generate password validator
    const validatorTemplate = await this.loadTemplate('tenant-auth/security/password.validator.ts.hbs');
    const validatorContent = validatorTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const validatorPath = path.join(baseDir, 'src/security/validators/PasswordValidator.ts');
    await fs.writeFile(validatorPath, validatorContent);
    result.files.push(validatorPath);

    // Generate rate limiter
    const rateLimiterTemplate = await this.loadTemplate('tenant-auth/security/rate-limiter.service.ts.hbs');
    const rateLimiterContent = rateLimiterTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const rateLimiterPath = path.join(baseDir, 'src/security/services/RateLimiterService.ts');
    await fs.writeFile(rateLimiterPath, rateLimiterContent);
    result.files.push(rateLimiterPath);

    result.commands.push('npm install bcrypt rate-limiter-flexible');
  }

  private async generateConfigurations(
    options: TenantAuthenticationOptions,
    result: GenerationResult
  ): Promise<void> {
    const baseDir = path.join(process.cwd(), 'tenant-auth');

    // Generate authentication configuration
    const configTemplate = await this.loadTemplate('tenant-auth/config/auth.config.ts.hbs');
    const configContent = configTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const configPath = path.join(baseDir, 'config/auth/auth.config.ts');
    await fs.writeFile(configPath, configContent);
    result.files.push(configPath);

    // Generate environment variables
    const envTemplate = await this.loadTemplate('tenant-auth/config/env.example.hbs');
    const envContent = envTemplate({
      ...options,
      timestamp: new Date().toISOString()
    });

    const envPath = path.join(baseDir, '.env.example');
    await fs.writeFile(envPath, envContent);
    result.files.push(envPath);

    result.nextSteps.push('Configure authentication provider credentials in .env file');
    result.nextSteps.push('Set up JWT secrets and token expiration times');
    result.nextSteps.push('Configure multi-factor authentication providers if enabled');
    result.nextSteps.push('Set up session storage and management');
    result.nextSteps.push('Configure SSO and federated identity providers');
    result.nextSteps.push('Test authentication flows and security measures');
  }

  private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    const fullPath = path.join(__dirname, '../../templates', templatePath);
    
    if (!await fs.pathExists(fullPath)) {
      const basicTemplate = this.createBasicTemplate(templatePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, basicTemplate);
    }
    
    const templateContent = await fs.readFile(fullPath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  private createBasicTemplate(templatePath: string): string {
    if (templatePath.includes('auth.module.ts.hbs')) {
      return `import { Module } from '@nestjs/common';
import { TenantAuthService } from './services/TenantAuthService';
import { AuthController } from './controllers/AuthController';

@Module({
  providers: [TenantAuthService],
  controllers: [AuthController],
  exports: [TenantAuthService],
})
export class TenantAuthModule {}`;
    }

    return `// Generated template for ${templatePath}
// Tenant Authentication: {{name}}
// Provider: {{provider}}
// Multi-factor auth: {{multiFactorAuth}}
// Session management: {{sessionManagement}}
// Generated at: {{timestamp}}

export class TenantAuthService {
  // TODO: Implement tenant authentication logic for ${templatePath}
}`;
  }

  protected async validateOptions(options: TenantAuthenticationOptions): Promise<void> {
    if (!options.name) {
      throw new Error('Tenant authentication system name is required');
    }

    if (!options.provider) {
      throw new Error('Authentication provider is required');
    }

    const validProviders = ['jwt', 'oauth', 'saml', 'oidc', 'bankid'];
    if (!validProviders.includes(options.provider)) {
      throw new Error(`Invalid authentication provider. Must be one of: ${validProviders.join(', ')}`);
    }

    if (!options.sessionManagement) {
      throw new Error('Session management type is required');
    }

    const validSessionTypes = ['stateless', 'stateful', 'hybrid'];
    if (!validSessionTypes.includes(options.sessionManagement)) {
      throw new Error(`Invalid session management type. Must be one of: ${validSessionTypes.join(', ')}`);
    }

    if (options.tokenExpiration && options.tokenExpiration <= 0) {
      throw new Error('Token expiration must be a positive number');
    }
  }
}