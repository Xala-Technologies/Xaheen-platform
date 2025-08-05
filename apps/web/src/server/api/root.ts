import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from './trpc';

export const appRouter = createTRPCRouter({
  // Project procedures
  project: createTRPCRouter({
    list: protectedProcedure.query(async () => {
      // In production, fetch from database
      return [
        {
          id: '1',
          name: 'E-commerce Platform',
          platform: 'nextjs',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          nsmClassification: 'RESTRICTED' as const,
          status: 'active' as const,
          componentsCount: 47
        }
      ];
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string(),
        platform: z.string(),
        features: z.array(z.string()),
        nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'])
      }))
      .mutation(async ({ input }) => {
        // In production, save to database and trigger generation
        return {
          id: Date.now().toString(),
          ...input,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          status: 'active' as const,
          componentsCount: 0
        };
      })
  }),

  // Generation procedures
  generation: createTRPCRouter({
    generate: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        platform: z.string(),
        features: z.array(z.string()),
        nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'])
      }))
      .mutation(async ({ input }) => {
        // In production, this would connect to MCP server
        return {
          jobId: Date.now().toString(),
          status: 'queued'
        };
      }),
    
    status: protectedProcedure
      .input(z.object({
        jobId: z.string()
      }))
      .query(async ({ input }) => {
        // Mock status check
        return {
          jobId: input.jobId,
          status: 'completed',
          progress: 100,
          files: [
            'src/components/UserManagement.tsx',
            'src/components/UserTable.tsx',
            'src/hooks/useUsers.ts'
          ]
        };
      })
  }),

  // Marketplace procedures  
  marketplace: createTRPCRouter({
    plugins: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional()
      }))
      .query(async ({ input }) => {
        // Mock plugin data
        const plugins = [
          {
            id: 'bankid-auth',
            name: 'BankID Authentication',
            description: 'Complete Norwegian BankID integration',
            author: 'Xaheen Official',
            category: 'Authentication',
            downloads: 12453,
            rating: 4.9,
            version: '2.3.1'
          }
        ];
        
        return plugins.filter(p => 
          (!input.category || p.category === input.category) &&
          (!input.search || p.name.toLowerCase().includes(input.search.toLowerCase()))
        );
      }),
    
    install: protectedProcedure
      .input(z.object({
        pluginId: z.string()
      }))
      .mutation(async ({ input }) => {
        // Mock installation
        return {
          success: true,
          pluginId: input.pluginId
        };
      })
  }),

  // License procedures
  license: createTRPCRouter({
    current: protectedProcedure.query(async () => {
      return {
        plan: 'professional',
        validUntil: '2024-12-31',
        usage: {
          projects: 15,
          generations: 847,
          limits: {
            projects: 20,
            generations: 1000
          }
        }
      };
    }),
    
    activate: protectedProcedure
      .input(z.object({
        licenseKey: z.string()
      }))
      .mutation(async ({ input }) => {
        // Validate license key
        if (input.licenseKey.length !== 19) {
          throw new Error('Invalid license key format');
        }
        
        return {
          success: true,
          plan: 'enterprise',
          validUntil: '2025-12-31'
        };
      })
  }),

  // Analytics procedures
  analytics: createTRPCRouter({
    overview: protectedProcedure.query(async () => {
      return {
        totalProjects: 156,
        componentsGenerated: 3847,
        activePlatforms: 7,
        templatesAvailable: 191,
        weeklyGrowth: {
          projects: 12.5,
          components: 23.1,
          templates: 8
        }
      };
    }),
    
    activity: protectedProcedure.query(async () => {
      return [
        {
          id: '1',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          action: 'Generated UserManagement component',
          platform: 'Next.js',
          nsmClassification: 'RESTRICTED' as const
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          action: 'Created BankID authentication flow',
          platform: 'React',
          nsmClassification: 'CONFIDENTIAL' as const
        }
      ];
    })
  })
});

// Export type definition of API
export type AppRouter = typeof appRouter;