// apps/cli/src/templates/xala-templates.ts
import { ProjectTemplate } from "../types";

export const xalaTemplates: Record<string, ProjectTemplate> = {
	"xala-enterprise-app": {
		name: "Xala Enterprise Application",
		description: "Full-stack enterprise app with Norwegian compliance",
		dependencies: {
			// Core UI System
			"@xala-technologies/ui-system": "^5.0.0",

			// Frontend
			react: "^18.2.0",
			"react-dom": "^18.2.0",
			next: "^14.0.0",
			"@tanstack/react-query": "^5.0.0",

			// Backend
			hono: "^3.0.0",
			"@hono/zod-validator": "^0.2.0",
			"drizzle-orm": "^0.29.0",
			postgres: "^3.4.0",

			// Authentication
			lucia: "^3.0.0",
			"@lucia-auth/adapter-drizzle": "^1.0.0",

			// Validation
			zod: "^3.22.0",

			// Norwegian specific
			"norwegian-national-id-validator": "^4.0.0",
			"norwegian-organization-number": "^2.0.0",
		},
		devDependencies: {
			"@types/react": "^18.2.0",
			"@types/react-dom": "^18.2.0",
			"@types/node": "^20.0.0",
			typescript: "^5.3.0",
			tsx: "^4.0.0",
			vite: "^5.0.0",
			"@vitejs/plugin-react": "^4.2.0",
			tailwindcss: "^3.4.0",
			postcss: "^8.4.0",
			autoprefixer: "^10.4.0",
			eslint: "^8.50.0",
			prettier: "^3.1.0",
		},
		structure: {
			"apps/": {
				"web/": {
					"src/": {
						"app/": "Next.js app directory",
						"components/": "Application components",
						"features/": "Feature modules",
						"lib/": "Utilities and helpers",
						"styles/": "Global styles",
					},
				},
				"api/": {
					"src/": {
						"routes/": "API routes",
						"services/": "Business logic",
						"middleware/": "API middleware",
						"db/": "Database schema",
					},
				},
			},
			"packages/": {
				"shared/": "Shared types and utilities",
				"config/": "Shared configurations",
			},
		},
	},

	"xala-chat-interface": {
		name: "Xala Chat Interface",
		description: "AI chat application with Norwegian compliance",
		dependencies: {
			"@xala-technologies/ui-system": "^5.0.0",
			react: "^18.2.0",
			"react-dom": "^18.2.0",
			next: "^14.0.0",
			"@tanstack/react-query": "^5.0.0",
			ai: "^3.0.0",
			openai: "^4.0.0",
			zod: "^3.22.0",
		},
		structure: {
			"src/": {
				"app/": {
					"chat/": "Chat interface pages",
					"api/": "API routes for chat",
				},
				"components/": {
					"chat/": "Chat-specific components",
				},
				"lib/": {
					"ai/": "AI integration",
					"classification/": "NSM classification logic",
				},
			},
		},
	},

	"xala-government-portal": {
		name: "Xala Government Portal",
		description: "Norwegian government compliant portal",
		dependencies: {
			"@xala-technologies/ui-system": "^5.0.0",
			react: "^18.2.0",
			"react-dom": "^18.2.0",
			next: "^14.0.0",
			"@tanstack/react-query": "^5.0.0",
			"norwegian-national-id-validator": "^4.0.0",
			"norwegian-organization-number": "^2.0.0",
			"@altinn/altinn-js": "^1.0.0",
			zod: "^3.22.0",
		},
		structure: {
			"src/": {
				"app/": "Next.js app directory",
				"components/": {
					"forms/": "Government form components",
					"classification/": "NSM classification components",
				},
				"lib/": {
					"auth/": "BankID/MinID integration",
					"compliance/": "GDPR and compliance utilities",
				},
			},
		},
	},
};

// apps/cli/src/generators/xala-project-generator.ts
import fs from "fs-extra";
import path from "path";
import { ProjectConfig } from "../types";

export async function generateXalaProject(
	projectPath: string,
	config: ProjectConfig,
) {
	// Generate root layout with Xala UI System providers
	const rootLayoutContent = `import { 
  DesignSystemProvider,
  SSRProvider,
  HydrationProvider,
  ThemeProvider,
  LocaleProvider
} from '@xala-technologies/ui-system';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '${config.name}',
  description: 'Enterprise application built with Xala UI System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb-NO">
      <body className={inter.className}>
        <DesignSystemProvider 
          theme="${config.theme || "light"}" 
          platform="${config.platform || "web"}"
          locale="nb-NO"
          fallbackLocale="en"
        >
          <SSRProvider>
            <HydrationProvider>
              <ThemeProvider
                defaultTheme="${config.defaultTheme || "system"}"
                storageKey="${config.name}-theme"
              >
                <LocaleProvider defaultLocale="nb-NO">
                  {children}
                </LocaleProvider>
              </ThemeProvider>
            </HydrationProvider>
          </SSRProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}`;

	await fs.writeFile(
		path.join(projectPath, "apps/web/src/app/layout.tsx"),
		rootLayoutContent,
	);

	// Generate home page with Xala components
	const homePageContent = `import { 
  PageLayout,
  Section,
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Card,
  Grid
} from '@xala-technologies/ui-system';

export default function HomePage() {
  return (
    <PageLayout>
      <Section variant="hero">
        <Container>
          <Stack direction="col" gap="6" align="center">
            <Heading level={1}>Velkommen til ${config.name}</Heading>
            <Text variant="lead" color="secondary">
              Enterprise-grade Norwegian application built with Xala UI System
            </Text>
            <Stack direction="row" gap="4">
              <Button variant="primary" size="lg">
                Kom i gang
              </Button>
              <Button variant="outline" size="lg">
                Les mer
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Section>

      <Section>
        <Container>
          <Stack direction="col" gap="8">
            <Heading level={2} align="center">
              Funksjoner
            </Heading>
            <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="6">
              <Card>
                <Stack direction="col" gap="4">
                  <Heading level={3}>Norsk Compliance</Heading>
                  <Text>
                    Full støtte for NSM klassifisering, DigDir standarder, 
                    og WCAG 2.2 AAA tilgjengelighet.
                  </Text>
                </Stack>
              </Card>
              <Card>
                <Stack direction="col" gap="4">
                  <Heading level={3}>Enterprise Ready</Heading>
                  <Text>
                    Multi-tenant arkitektur med white-label støtte og 
                    avanserte sikkerhetsfunksjoner.
                  </Text>
                </Stack>
              </Card>
              <Card>
                <Stack direction="col" gap="4">
                  <Heading level={3}>Token-basert Design</Heading>
                  <Text>
                    Dynamisk theming med runtime token resolution og 
                    platform-optimaliserte opplevelser.
                  </Text>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}`;

	await fs.writeFile(
		path.join(projectPath, "apps/web/src/app/page.tsx"),
		homePageContent,
	);

	// Generate global styles with Xala token integration
	const globalStylesContent = `@import '@xala-technologies/ui-system/styles/core.css';
@import '@xala-technologies/ui-system/styles/tokens.css';

/* Custom styles using Xala design tokens */
:root {
  /* Override or extend Xala tokens here */
}

html {
  color-scheme: light dark;
}

body {
  background-color: var(--xala-colors-background-primary);
  color: var(--xala-colors-text-primary);
  font-family: var(--xala-fonts-body);
}

/* Custom utility classes that complement Xala UI System */
.gradient-brand {
  background: linear-gradient(
    135deg,
    var(--xala-colors-brand-primary),
    var(--xala-colors-brand-secondary)
  );
}`;

	await fs.writeFile(
		path.join(projectPath, "apps/web/src/app/globals.css"),
		globalStylesContent,
	);

	// Generate example components using Xala UI System
	await generateXalaComponents(projectPath, config);

	// Generate configuration files
	await generateXalaConfig(projectPath, config);
}

async function generateXalaComponents(
	projectPath: string,
	config: ProjectConfig,
) {
	// Generate a custom form component with Norwegian validation
	const norwegianFormContent = `import { 
  Card,
  Stack,
  Heading,
  PersonalNumberInput,
  OrganizationNumberInput,
  Input,
  Select,
  Button,
  Text,
  Alert
} from '@xala-technologies/ui-system';
import { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Navn må være minst 2 tegn'),
  personalNumber: z.string().length(11, 'Fødselsnummer må være 11 siffer'),
  organizationNumber: z.string().length(9, 'Organisasjonsnummer må være 9 siffer').optional(),
  municipality: z.string().min(1, 'Velg kommune'),
});

export function NorwegianRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    personalNumber: '',
    organizationNumber: '',
    municipality: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = formSchema.parse(formData);
      // Handle successful submission
      console.log('Form submitted:', validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Stack direction="col" gap="6">
          <Heading level={3}>Registrering</Heading>
          
          <Input
            label="Fullt navn"
            placeholder="Ola Nordmann"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <PersonalNumberInput
            label="Fødselsnummer"
            placeholder="11 siffer"
            value={formData.personalNumber}
            onChange={(value) => setFormData({ ...formData, personalNumber: value })}
            error={errors.personalNumber}
            validation="strict"
            required
          />

          <OrganizationNumberInput
            label="Organisasjonsnummer (valgfritt)"
            placeholder="9 siffer"
            value={formData.organizationNumber}
            onChange={(value) => setFormData({ ...formData, organizationNumber: value })}
            error={errors.organizationNumber}
            brreg={true}
          />

          <Select
            label="Kommune"
            placeholder="Velg kommune"
            value={formData.municipality}
            onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
            error={errors.municipality}
            required
          >
            <option value="">Velg kommune</option>
            <option value="oslo">Oslo</option>
            <option value="bergen">Bergen</option>
            <option value="trondheim">Trondheim</option>
            <option value="stavanger">Stavanger</option>
          </Select>

          <Button type="submit" variant="primary" fullWidth>
            Send inn registrering
          </Button>
        </Stack>
      </form>
    </Card>
  );
}`;

	await fs.ensureDir(path.join(projectPath, "apps/web/src/components/forms"));
	await fs.writeFile(
		path.join(
			projectPath,
			"apps/web/src/components/forms/NorwegianRegistrationForm.tsx",
		),
		norwegianFormContent,
	);

	// Generate a chat interface component
	if (config.features?.includes("chat")) {
		const chatInterfaceContent = `import {
  Stack,
  MessageBubble,
  ActionBar,
  ScrollArea,
  Input,
  Button,
  ClassificationIndicator
} from '@xala-technologies/ui-system';
import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  classification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT';
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [classification, setClassification] = useState<Message['classification']>('ÅPEN');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      classification,
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Dette er et svar fra AI-assistenten.',
        sender: 'assistant',
        timestamp: new Date(),
        classification: 'ÅPEN',
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <Stack direction="col" gap="0" className="h-screen">
      <ClassificationIndicator level={classification || 'ÅPEN'} />
      
      <ScrollArea className="flex-1 p-4">
        <Stack direction="col" gap="4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              variant={message.sender === 'user' ? 'sent' : 'received'}
              classification={message.classification}
              timestamp={message.timestamp.toLocaleTimeString('nb-NO')}
            >
              {message.content}
            </MessageBubble>
          ))}
        </Stack>
      </ScrollArea>

      <ActionBar>
        <Input
          placeholder="Skriv en melding..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1"
        />
        <Button onClick={sendMessage} variant="primary">
          Send
        </Button>
      </ActionBar>
    </Stack>
  );
}`;

		await fs.ensureDir(path.join(projectPath, "apps/web/src/components/chat"));
		await fs.writeFile(
			path.join(projectPath, "apps/web/src/components/chat/ChatInterface.tsx"),
			chatInterfaceContent,
		);
	}
}

async function generateXalaConfig(projectPath: string, config: ProjectConfig) {
	// Generate Xala-specific configuration
	const xalaConfigContent = `import { defineConfig } from '@xala-technologies/ui-system';

export default defineConfig({
  // Theme configuration
  theme: {
    defaultMode: '${config.defaultTheme || "system"}',
    customTokens: {
      colors: {
        // Add custom brand colors
        brand: {
          primary: '${config.brandColors?.primary || "#0066ff"}',
          secondary: '${config.brandColors?.secondary || "#ff6600"}',
        },
      },
    },
  },

  // Platform-specific settings
  platform: {
    target: '${config.platform || "web"}',
    ssr: true,
    hydration: {
      strategy: 'progressive',
    },
  },

  // Norwegian compliance settings
  compliance: {
    locale: 'nb-NO',
    fallbackLocale: 'en',
    classification: {
      enabled: ${config.features?.includes("classification") || false},
      levels: ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'],
    },
    wcag: {
      level: 'AAA',
      contrastRatio: 7,
    },
    gdpr: {
      enabled: true,
      consentRequired: true,
    },
  },

  // Multi-tenant configuration
  multiTenant: {
    enabled: ${config.features?.includes("multiTenant") || false},
    tenants: [
      {
        id: 'default',
        name: '${config.name}',
        theme: 'default',
      },
    ],
  },

  // Performance optimizations
  performance: {
    lazyLoad: true,
    bundleAnalysis: process.env.NODE_ENV === 'development',
    targetMetrics: {
      fcp: 1000, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      cls: 0.1,  // Cumulative Layout Shift
      fid: 100,  // First Input Delay
    },
  },
});`;

	await fs.writeFile(
		path.join(projectPath, "xala.config.ts"),
		xalaConfigContent,
	);

	// Generate TypeScript configuration with Xala UI System paths
	const tsconfigContent = {
		compilerOptions: {
			target: "ES2022",
			lib: ["ES2022", "dom", "dom.iterable"],
			module: "ESNext",
			moduleResolution: "bundler",
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			forceConsistentCasingInFileNames: true,
			resolveJsonModule: true,
			jsx: "preserve",
			incremental: true,
			paths: {
				"@/*": ["./src/*"],
				"@xala/*": ["./node_modules/@xala-technologies/ui-system/*"],
				"@components/*": ["./src/components/*"],
				"@features/*": ["./src/features/*"],
				"@lib/*": ["./src/lib/*"],
			},
		},
		include: ["**/*.ts", "**/*.tsx"],
		exclude: ["node_modules"],
	};

	await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsconfigContent, {
		spaces: 2,
	});
}

import { prompts } from "@clack/prompts";
// apps/cli/src/commands/create-xala.ts
import { Command } from "commander";
import { generateXalaProject } from "../generators/xala-project-generator";
import { xalaTemplates } from "../templates/xala-templates";

export function registerXalaCommand(program: Command) {
	program
		.command("create-xala [project-name]")
		.description("Create a new Xala-powered enterprise application")
		.option("-t, --template <template>", "Use a specific Xala template")
		.option("--classification", "Enable NSM classification features")
		.option("--multi-tenant", "Enable multi-tenant support")
		.option("--platform <platform>", "Target platform (web|mobile|desktop)")
		.action(async (projectName, options) => {
			const config: any = {};

			// Interactive setup
			if (!projectName) {
				projectName = await prompts.text({
					message: "What is your project name?",
					placeholder: "my-xala-app",
				});
			}

			config.name = projectName;

			// Template selection
			const template =
				options.template ||
				(await prompts.select({
					message: "Select a Xala template:",
					options: [
						{ value: "xala-enterprise-app", label: "Enterprise Application" },
						{ value: "xala-chat-interface", label: "AI Chat Interface" },
						{ value: "xala-government-portal", label: "Government Portal" },
						{ value: "custom", label: "Custom Configuration" },
					],
				}));

			config.template = template;

			// Platform selection
			config.platform =
				options.platform ||
				(await prompts.select({
					message: "Select target platform:",
					options: [
						{ value: "web", label: "Web Application" },
						{ value: "mobile", label: "Mobile Application" },
						{ value: "desktop", label: "Desktop Application" },
						{ value: "all", label: "Multi-platform" },
					],
				}));

			// Feature selection
			const features = await prompts.multiselect({
				message: "Select features to include:",
				options: [
					{
						value: "classification",
						label: "NSM Classification",
						hint: "ÅPEN, BEGRENSET, etc.",
					},
					{
						value: "chat",
						label: "Chat Interface",
						hint: "MessageBubble, ActionBar",
					},
					{
						value: "forms",
						label: "Norwegian Forms",
						hint: "Personal/Org number validation",
					},
					{
						value: "multiTenant",
						label: "Multi-tenant",
						hint: "White-label support",
					},
					{
						value: "auth",
						label: "Authentication",
						hint: "BankID/MinID integration",
					},
					{
						value: "analytics",
						label: "Analytics",
						hint: "GDPR-compliant analytics",
					},
				],
			});

			config.features = features;

			// Theme configuration
			const themeMode = await prompts.select({
				message: "Default theme mode:",
				options: [
					{ value: "light", label: "Light" },
					{ value: "dark", label: "Dark" },
					{ value: "system", label: "System (auto)" },
				],
			});

			config.defaultTheme = themeMode;

			// Generate the project
			await generateXalaProject(projectName, config);

			console.log(`
✅ Xala project created successfully!

Next steps:
  cd ${projectName}
  npm install
  npm run dev

Resources:
  📚 Xala UI System Docs: https://github.com/Xala-Technologies/Xala-Enterprise-UI-System
  🎨 Design Tokens: View xala.config.ts
  🏢 Enterprise Support: contact@xala.no
`);
		});
}
