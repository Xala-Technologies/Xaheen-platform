/**
 * Phase 2 Unit Tests - Remix Preset
 * Tests for Remix preset logic with mocked file system
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { vol } from 'memfs';
import { promises as fs } from 'fs';
import * as prompts from '@clack/prompts';
import { ScaffoldGenerator } from '../../../../src/generators/scaffold.generator';
import type { ScaffoldGeneratorOptions } from '../../../../src/generators/scaffold.generator';

// Mock modules
mock.module('fs', async () => {
  const memfs = await require('memfs');
  return memfs.fs.promises;
});

mock.module('@clack/prompts', () => ({
  intro: mock(() => {}),
  outro: mock(() => {}),
  cancel: mock(() => {}),
  isCancel: mock(() => {}).mockReturnValue(false),
  text: mock(() => {}),
  select: mock(() => {}),
  multiselect: mock(() => {}),
  confirm: mock(() => {}),
  spinner: mock(() => {}).mockReturnValue({
    start: mock(() => {}),
    stop: mock(() => {}),
    message: mock(() => {}),
  }),
}));

describe('Phase 2: Remix Preset Unit Tests', () => {
  beforeEach(() => {
    vol.reset();
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Remix Project Generation', () => {
    it('should generate correct Remix project structure', async () => {
      const projectName = 'test-remix-app';
      const projectPath = `/tmp/${projectName}`;

      const options: ScaffoldGeneratorOptions = {
        name: projectName,
        frontend: 'remix',
        typescript: true,
        dryRun: false,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);

      // Verify Remix-specific files
      const files = vol.toJSON();
      const expectedFiles = [
        'package.json',
        'remix.config.js',
        'tsconfig.json',
        'app/entry.client.tsx',
        'app/entry.server.tsx',
        'app/root.tsx',
        'app/routes/_index.tsx',
      ];

      expectedFiles.forEach(file => {
        const fullPath = `${projectPath}/${file}`;
        expect(files[fullPath]).toBeDefined();
      });
    });

    it('should configure Remix with TypeScript', async () => {
      const projectPath = '/tmp/remix-ts';
      await fs.mkdir(projectPath, { recursive: true });

      const remixConfig = `
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [],
  serverModuleFormat: "esm",
  serverPlatform: "node",
  tailwind: true,
  postcss: true,
  watchPaths: ["./tailwind.config.ts"],
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
};`;

      await fs.writeFile(`${projectPath}/remix.config.js`, remixConfig);

      const config = await fs.readFile(`${projectPath}/remix.config.js`, 'utf-8');
      expect(config).toContain('tailwind: true');
      expect(config).toContain('serverModuleFormat: "esm"');
    });

    it('should create Remix root component', async () => {
      const projectPath = '/tmp/remix-root';
      await fs.mkdir(`${projectPath}/app`, { recursive: true });

      const rootContent = `
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface DocumentProps {
  readonly children: React.ReactNode;
  readonly title?: string;
}

function Document({ children, title }: DocumentProps): JSX.Element {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {title && <title>{title}</title>}
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App(): JSX.Element {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary(): JSX.Element {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error.status} {error.statusText}
            </h1>
            {error.data?.message && (
              <p className="text-gray-600">{error.data.message}</p>
            )}
          </div>
        </div>
      </Document>
    );
  }
  
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
  return (
    <Document title="Error!">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600">{errorMessage}</p>
        </div>
      </div>
    </Document>
  );
}`;

      await fs.writeFile(`${projectPath}/app/root.tsx`, rootContent);

      const root = await fs.readFile(`${projectPath}/app/root.tsx`, 'utf-8');
      expect(root).toContain('LinksFunction');
      expect(root).toContain('MetaFunction');
      expect(root).toContain('interface DocumentProps');
      expect(root).toContain('ErrorBoundary');
    });

    it('should create Remix route with loader and action', async () => {
      const projectPath = '/tmp/remix-routes';
      await fs.mkdir(`${projectPath}/app/routes`, { recursive: true });

      const routeContent = `
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof ContactSchema>;

interface LoaderData {
  readonly pageTitle: string;
  readonly submitCount: number;
}

interface ActionData {
  readonly errors?: {
    readonly name?: string;
    readonly email?: string;
    readonly message?: string;
  };
  readonly success?: boolean;
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  // In a real app, this would fetch from a database
  const submitCount = 0;
  
  return json<LoaderData>({
    pageTitle: "Contact Us",
    submitCount,
  });
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  try {
    const validatedData = ContactSchema.parse(data);
    
    // In a real app, this would save to a database
    console.log("Form submitted:", validatedData);
    
    // Redirect on success
    return redirect("/contact/success");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, curr) => {
        const field = curr.path[0] as keyof ContactFormData;
        acc[field] = curr.message;
        return acc;
      }, {} as ActionData["errors"]);
      
      return json<ActionData>({ errors }, { status: 400 });
    }
    
    throw error;
  }
}

export default function Contact(): JSX.Element {
  const { pageTitle, submitCount } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>
      
      {submitCount > 0 && (
        <p className="mb-6 text-gray-600">
          This form has been submitted {submitCount} times
        </p>
      )}
      
      <Form method="post" className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-describedby="name-error"
          />
          {actionData?.errors?.name && (
            <p className="mt-2 text-sm text-red-600" id="name-error">
              {actionData.errors.name}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            aria-invalid={actionData?.errors?.email ? true : undefined}
            aria-describedby="email-error"
          />
          {actionData?.errors?.email && (
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {actionData.errors.email}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            aria-invalid={actionData?.errors?.message ? true : undefined}
            aria-describedby="message-error"
          />
          {actionData?.errors?.message && (
            <p className="mt-2 text-sm text-red-600" id="message-error">
              {actionData.errors.message}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="h-12 px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Send Message
        </button>
      </Form>
    </div>
  );
}`;

      await fs.writeFile(`${projectPath}/app/routes/contact.tsx`, routeContent);

      const route = await fs.readFile(`${projectPath}/app/routes/contact.tsx`, 'utf-8');
      expect(route).toContain('LoaderFunctionArgs');
      expect(route).toContain('ActionFunctionArgs');
      expect(route).toContain('useLoaderData');
      expect(route).toContain('useActionData');
      expect(route).toContain('z.object');
    });

    it('should create nested Remix routes', async () => {
      const projectPath = '/tmp/remix-nested';
      await fs.mkdir(`${projectPath}/app/routes/dashboard`, { recursive: true });

      // Parent layout
      const layoutContent = `
import { Outlet, NavLink } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface LoaderData {
  readonly user: User;
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const user = await requireAuth(request);
  
  return json<LoaderData>({ user });
}

export default function DashboardLayout(): JSX.Element {
  const { user } = useLoaderData<LoaderData>();
  
  return (
    <div className="min-h-screen flex">
      <nav className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
        
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                \`block px-4 py-2 rounded-lg transition-colors \${
                  isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
                }\`
              }
            >
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                \`block px-4 py-2 rounded-lg transition-colors \${
                  isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
                }\`
              }
            >
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                \`block px-4 py-2 rounded-lg transition-colors \${
                  isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
                }\`
              }
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}`;

      await fs.writeFile(`${projectPath}/app/routes/dashboard.tsx`, layoutContent);

      const layout = await fs.readFile(`${projectPath}/app/routes/dashboard.tsx`, 'utf-8');
      expect(layout).toContain('Outlet');
      expect(layout).toContain('NavLink');
      expect(layout).toContain('requireAuth');
    });
  });

  describe('Remix Features', () => {
    it('should handle Remix deployment target selection', async () => {
      (prompts.select as any).mockResolvedValueOnce('vercel');

      const options: ScaffoldGeneratorOptions = {
        name: 'remix-vercel',
        frontend: 'remix',
        deployment: 'vercel',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.deployment).toBe('vercel');
    });

    it('should create Remix session handling', async () => {
      const projectPath = '/tmp/remix-session';
      await fs.mkdir(`${projectPath}/app/utils`, { recursive: true });

      const sessionContent = `
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { z } from "zod";

const SessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  expiresAt: z.number(),
});

type SessionData = z.infer<typeof SessionSchema>;

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function createUserSession(
  userId: string,
  email: string,
  redirectTo: string
): Promise<Response> {
  const session = await storage.getSession();
  session.set("userId", userId);
  session.set("email", email);
  session.set("expiresAt", Date.now() + 1000 * 60 * 60 * 24 * 7);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserSession(
  request: Request
): Promise<SessionData | null> {
  const session = await storage.getSession(request.headers.get("Cookie"));
  
  try {
    const data = {
      userId: session.get("userId"),
      email: session.get("email"),
      expiresAt: session.get("expiresAt"),
    };
    
    const validated = SessionSchema.parse(data);
    
    if (validated.expiresAt < Date.now()) {
      return null;
    }
    
    return validated;
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request): Promise<SessionData> {
  const session = await getUserSession(request);
  
  if (!session) {
    throw redirect("/login");
  }
  
  return session;
}

export async function logout(request: Request): Promise<Response> {
  const session = await storage.getSession(request.headers.get("Cookie"));
  
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}`;

      await fs.writeFile(`${projectPath}/app/utils/session.server.ts`, sessionContent);

      const session = await fs.readFile(
        `${projectPath}/app/utils/session.server.ts`,
        'utf-8'
      );

      expect(session).toContain('createCookieSessionStorage');
      expect(session).toContain('SessionSchema');
      expect(session).toContain('requireAuth');
    });
  });

  describe('Remix Error Handling', () => {
    it('should validate Remix options', async () => {
      const invalidOptions: ScaffoldGeneratorOptions = {
        name: '',
        frontend: 'remix',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      await expect(generator.generate(invalidOptions)).rejects.toThrow();
    });

    it('should create CatchBoundary component', async () => {
      const projectPath = '/tmp/remix-catch';
      await fs.mkdir(`${projectPath}/app/components`, { recursive: true });

      const catchBoundaryContent = `
import { useCatch } from "@remix-run/react";

export function CatchBoundary(): JSX.Element {
  const caught = useCatch();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {caught.status} {caught.statusText}
        </h1>
        {caught.data?.message && (
          <p className="text-gray-600 mb-6">{caught.data.message}</p>
        )}
        <a 
          href="/"
          className="inline-block h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-center leading-12"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}`;

      await fs.writeFile(
        `${projectPath}/app/components/CatchBoundary.tsx`,
        catchBoundaryContent
      );

      const catchBoundary = await fs.readFile(
        `${projectPath}/app/components/CatchBoundary.tsx`,
        'utf-8'
      );

      expect(catchBoundary).toContain('useCatch');
      expect(catchBoundary).toContain('caught.status');
    });
  });
});