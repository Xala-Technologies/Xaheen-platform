/**
 * Extended Service Registry Tests
 * 
 * Tests for the new service templates (storage, queue, realtime).
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceRegistry } from './service-registry.js';
import type { ServiceTemplate } from '../../types/index.js';

describe('ServiceRegistry - Extended Templates', () => {
  let serviceRegistry: ServiceRegistry;

  beforeEach(async () => {
    serviceRegistry = new ServiceRegistry();
    await serviceRegistry.initialize();
  });

  describe('Storage Service Templates', () => {
    it('should have AWS S3 storage template', async () => {
      const template = await serviceRegistry.getTemplate('storage', 's3');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('aws-s3');
      expect(template?.type).toBe('storage');
      expect(template?.provider).toBe('s3');
      expect(template?.description).toContain('AWS S3');
      
      // Check injection points
      expect(template?.injectionPoints).toHaveLength(2);
      expect(template?.injectionPoints[0].target).toBe('src/lib/storage.ts');
      
      // Check environment variables
      expect(template?.envVariables).toHaveLength(4);
      const envNames = template?.envVariables.map(v => v.name);
      expect(envNames).toContain('AWS_ACCESS_KEY_ID');
      expect(envNames).toContain('AWS_SECRET_ACCESS_KEY');
      expect(envNames).toContain('S3_BUCKET_NAME');
      
      // Check template content includes S3 functions
      const fileContent = template?.injectionPoints[0].template;
      expect(fileContent).toContain('S3Client');
      expect(fileContent).toContain('uploadFile');
      expect(fileContent).toContain('getSignedUrl');
    });

    it('should have Cloudinary storage template', async () => {
      const template = await serviceRegistry.getTemplate('storage', 'cloudinary');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('cloudinary');
      expect(template?.type).toBe('storage');
      expect(template?.provider).toBe('cloudinary');
      expect(template?.description).toContain('Cloudinary');
      
      // Check injection points
      expect(template?.injectionPoints).toHaveLength(2);
      expect(template?.injectionPoints[0].target).toBe('src/lib/cloudinary.ts');
      
      // Check environment variables
      expect(template?.envVariables).toHaveLength(3);
      const envNames = template?.envVariables.map(v => v.name);
      expect(envNames).toContain('CLOUDINARY_CLOUD_NAME');
      expect(envNames).toContain('CLOUDINARY_API_KEY');
      expect(envNames).toContain('CLOUDINARY_API_SECRET');
      
      // Check template content includes Cloudinary functions
      const fileContent = template?.injectionPoints[0].template;
      expect(fileContent).toContain('cloudinary');
      expect(fileContent).toContain('uploadImage');
      expect(fileContent).toContain('getOptimizedUrl');
    });
  });

  describe('Queue Service Templates', () => {
    it('should have BullMQ queue template', async () => {
      const template = await serviceRegistry.getTemplate('queue', 'bullmq');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('bullmq');
      expect(template?.type).toBe('queue');
      expect(template?.provider).toBe('bullmq');
      expect(template?.description).toContain('BullMQ');
      
      // Check injection points
      expect(template?.injectionPoints).toHaveLength(3);
      const targets = template?.injectionPoints.map(ip => ip.target);
      expect(targets).toContain('src/lib/queue.ts');
      expect(targets).toContain('src/workers/email.worker.ts');
      
      // Check dependencies
      expect(template?.dependencies).toHaveLength(1);
      expect(template?.dependencies[0].serviceType).toBe('cache');
      expect(template?.dependencies[0].provider).toBe('redis');
      expect(template?.dependencies[0].required).toBe(true);
      
      // Check template content
      const queueContent = template?.injectionPoints[0].template;
      expect(queueContent).toContain('BullMQ');
      expect(queueContent).toContain('Queue');
      expect(queueContent).toContain('Worker');
      expect(queueContent).toContain('emailQueue');
    });
  });

  describe('Realtime Service Templates', () => {
    it('should have Socket.io realtime template', async () => {
      const template = await serviceRegistry.getTemplate('realtime', 'socket.io');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('socket.io');
      expect(template?.type).toBe('realtime');
      expect(template?.provider).toBe('socket.io');
      expect(template?.description).toContain('Socket.io');
      
      // Check injection points
      expect(template?.injectionPoints).toHaveLength(3);
      const targets = template?.injectionPoints.map(ip => ip.target);
      expect(targets).toContain('src/lib/socket-server.ts');
      expect(targets).toContain('src/lib/socket-client.ts');
      
      // Check environment variables
      expect(template?.envVariables).toHaveLength(3);
      const envNames = template?.envVariables.map(v => v.name);
      expect(envNames).toContain('NEXT_PUBLIC_SOCKET_URL');
      
      // Check server template content
      const serverContent = template?.injectionPoints[0].template;
      expect(serverContent).toContain('io.on(\'connection\'');
      expect(serverContent).toContain('socket.join');
      expect(serverContent).toContain('emit');
      
      // Check client template content
      const clientContent = template?.injectionPoints[1].template;
      expect(clientContent).toContain('socket.io-client');
      expect(clientContent).toContain('initializeSocket');
    });

    it('should have Pusher realtime template', async () => {
      const template = await serviceRegistry.getTemplate('realtime', 'pusher');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('pusher');
      expect(template?.type).toBe('realtime');
      expect(template?.provider).toBe('pusher');
      expect(template?.description).toContain('Pusher');
      
      // Check injection points
      expect(template?.injectionPoints).toHaveLength(3);
      const targets = template?.injectionPoints.map(ip => ip.target);
      expect(targets).toContain('src/lib/pusher-server.ts');
      expect(targets).toContain('src/lib/pusher-client.ts');
      
      // Check environment variables
      expect(template?.envVariables).toHaveLength(4);
      const envNames = template?.envVariables.map(v => v.name);
      expect(envNames).toContain('PUSHER_APP_ID');
      expect(envNames).toContain('PUSHER_SECRET');
      expect(envNames).toContain('NEXT_PUBLIC_PUSHER_KEY');
      expect(envNames).toContain('NEXT_PUBLIC_PUSHER_CLUSTER');
      
      // Check template content
      const serverContent = template?.injectionPoints[0].template;
      expect(serverContent).toContain('pusherServer');
      expect(serverContent).toContain('triggerEvent');
      expect(serverContent).toContain('authenticateChannel');
    });
  });

  describe('Template Count and Coverage', () => {
    it('should have all expected service types', async () => {
      const allTemplates = await serviceRegistry.listTemplates();
      
      // Count templates by type
      const templatesByType = allTemplates.reduce((acc, template) => {
        acc[template.type] = (acc[template.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Verify we have templates for all major service types
      expect(templatesByType['auth']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['database']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['payments']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['email']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['analytics']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['monitoring']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['cache']).toBeGreaterThanOrEqual(1);
      expect(templatesByType['storage']).toBeGreaterThanOrEqual(2); // S3 and Cloudinary
      expect(templatesByType['queue']).toBeGreaterThanOrEqual(1); // BullMQ
      expect(templatesByType['realtime']).toBeGreaterThanOrEqual(2); // Socket.io and Pusher
    });

    it('should have proper priorities for all templates', async () => {
      const allTemplates = await serviceRegistry.listTemplates();
      
      for (const template of allTemplates) {
        for (const injectionPoint of template.injectionPoints) {
          expect(injectionPoint.priority).toBeDefined();
          expect(injectionPoint.priority).toBeGreaterThan(0);
          expect(injectionPoint.priority).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should have valid environment variable types', async () => {
      const allTemplates = await serviceRegistry.listTemplates();
      const validTypes = ['string', 'number', 'boolean', 'url', 'secret'];
      
      for (const template of allTemplates) {
        for (const envVar of template.envVariables) {
          expect(envVar.type).toBeDefined();
          expect(validTypes).toContain(envVar.type);
          
          // Sensitive variables should be marked
          if (envVar.type === 'secret' || envVar.name.includes('SECRET') || envVar.name.includes('KEY')) {
            expect(envVar.sensitive).toBe(true);
          }
        }
      }
    });
  });

  describe('Template Dependencies', () => {
    it('should have correct dependency for BullMQ', async () => {
      const template = await serviceRegistry.getTemplate('queue', 'bullmq');
      
      expect(template?.dependencies).toHaveLength(1);
      expect(template?.dependencies[0]).toEqual({
        serviceType: 'cache',
        provider: 'redis',
        required: true
      });
    });

    it('should have no dependencies for standalone services', async () => {
      const storageTemplate = await serviceRegistry.getTemplate('storage', 's3');
      const realtimeTemplate = await serviceRegistry.getTemplate('realtime', 'socket.io');
      
      expect(storageTemplate?.dependencies).toHaveLength(0);
      expect(realtimeTemplate?.dependencies).toHaveLength(0);
    });
  });
});