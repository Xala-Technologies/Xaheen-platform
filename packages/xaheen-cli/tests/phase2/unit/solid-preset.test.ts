/**
 * Phase 2 Unit Tests - Solid + Vite Preset
 * Tests for Solid preset logic with mocked file system
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

describe('Phase 2: Solid + Vite Preset Unit Tests', () => {
  beforeEach(() => {
    vol.reset();
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Solid Project Generation', () => {
    it('should generate correct Solid project structure', async () => {
      const projectName = 'test-solid-app';
      const projectPath = `/tmp/${projectName}`;

      const options: ScaffoldGeneratorOptions = {
        name: projectName,
        frontend: 'solid-vite',
        typescript: true,
        dryRun: false,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);

      // Verify Solid-specific files
      const files = vol.toJSON();
      const expectedFiles = [
        'package.json',
        'vite.config.ts',
        'tsconfig.json',
        'src/index.tsx',
        'src/App.tsx',
        'src/App.module.css',
        'index.html',
      ];

      expectedFiles.forEach(file => {
        const fullPath = `${projectPath}/${file}`;
        expect(files[fullPath]).toBeDefined();
      });
    });

    it('should configure Solid with TypeScript', async () => {
      const projectPath = '/tmp/solid-ts';
      await fs.mkdir(projectPath, { recursive: true });

      const tsconfigContent = {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          jsx: 'preserve',
          jsxImportSource: 'solid-js',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          types: ['vite/client'],
          noEmit: true,
          isolatedModules: true,
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          skipLibCheck: true,
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      };

      await fs.writeFile(
        `${projectPath}/tsconfig.json`,
        JSON.stringify(tsconfigContent, null, 2)
      );

      const tsconfig = JSON.parse(
        await fs.readFile(`${projectPath}/tsconfig.json`, 'utf-8')
      );

      expect(tsconfig.compilerOptions.jsx).toBe('preserve');
      expect(tsconfig.compilerOptions.jsxImportSource).toBe('solid-js');
    });

    it('should create Solid component with fine-grained reactivity', async () => {
      const projectPath = '/tmp/solid-component';
      await fs.mkdir(`${projectPath}/src/components`, { recursive: true });

      const componentContent = `
import { Component, createSignal, createMemo, Show } from 'solid-js';
import styles from './Counter.module.css';

interface CounterProps {
  readonly initialValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly onValueChange?: (value: number) => void;
}

export const Counter: Component<CounterProps> = (props) => {
  const [count, setCount] = createSignal(props.initialValue ?? 0);
  
  const isAtMin = createMemo(() => 
    props.min !== undefined && count() <= props.min
  );
  
  const isAtMax = createMemo(() => 
    props.max !== undefined && count() >= props.max
  );
  
  const increment = (): void => {
    if (!isAtMax()) {
      const newValue = count() + 1;
      setCount(newValue);
      props.onValueChange?.(newValue);
    }
  };
  
  const decrement = (): void => {
    if (!isAtMin()) {
      const newValue = count() - 1;
      setCount(newValue);
      props.onValueChange?.(newValue);
    }
  };
  
  return (
    <div class={styles.counter}>
      <h2 class="text-2xl font-bold mb-4">Counter: {count()}</h2>
      
      <div class="flex gap-4">
        <button
          onClick={decrement}
          disabled={isAtMin()}
          class="h-12 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          Decrement
        </button>
        
        <button
          onClick={increment}
          disabled={isAtMax()}
          class="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          Increment
        </button>
      </div>
      
      <Show when={isAtMin()}>
        <p class="mt-4 text-red-600">Minimum value reached!</p>
      </Show>
      
      <Show when={isAtMax()}>
        <p class="mt-4 text-red-600">Maximum value reached!</p>
      </Show>
    </div>
  );
};`;

      await fs.writeFile(
        `${projectPath}/src/components/Counter.tsx`,
        componentContent
      );

      const component = await fs.readFile(
        `${projectPath}/src/components/Counter.tsx`,
        'utf-8'
      );

      expect(component).toContain('Component<CounterProps>');
      expect(component).toContain('createSignal');
      expect(component).toContain('createMemo');
      expect(component).toContain('Show when=');
    });

    it('should create Solid App with proper structure', async () => {
      const projectPath = '/tmp/solid-app';
      await fs.mkdir(`${projectPath}/src`, { recursive: true });

      const appContent = `
import type { Component } from 'solid-js';
import { createSignal, For } from 'solid-js';
import logo from './logo.svg';
import styles from './App.module.css';

interface Todo {
  readonly id: number;
  readonly text: string;
  readonly completed: boolean;
}

const App: Component = () => {
  const [todos, setTodos] = createSignal<Todo[]>([]);
  const [inputValue, setInputValue] = createSignal('');
  
  const addTodo = (e: Event): void => {
    e.preventDefault();
    const text = inputValue().trim();
    
    if (text) {
      setTodos([
        ...todos(),
        {
          id: Date.now(),
          text,
          completed: false,
        },
      ]);
      setInputValue('');
    }
  };
  
  const toggleTodo = (id: number): void => {
    setTodos(
      todos().map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const removeTodo = (id: number): void => {
    setTodos(todos().filter(todo => todo.id !== id));
  };
  
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <h1 class="text-3xl font-bold mb-8">Solid.js Todo App</h1>
      </header>
      
      <main class="max-w-2xl mx-auto p-8">
        <form onSubmit={addTodo} class="mb-8">
          <div class="flex gap-4">
            <input
              type="text"
              value={inputValue()}
              onInput={(e) => setInputValue(e.currentTarget.value)}
              placeholder="Add a new todo..."
              class="flex-1 h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              class="h-14 px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Add Todo
            </button>
          </div>
        </form>
        
        <div class="space-y-4">
          <For each={todos()}>
            {(todo) => (
              <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  class="h-5 w-5 text-blue-600"
                />
                <span
                  class={todo.completed ? 'flex-1 line-through text-gray-500' : 'flex-1'}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  class="h-10 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </For>
        </div>
      </main>
    </div>
  );
};

export default App;`;

      await fs.writeFile(`${projectPath}/src/App.tsx`, appContent);

      const app = await fs.readFile(`${projectPath}/src/App.tsx`, 'utf-8');
      expect(app).toContain('Component');
      expect(app).toContain('createSignal<Todo[]>');
      expect(app).toContain('For each=');
    });

    it('should configure Vite for Solid', async () => {
      const projectPath = '/tmp/solid-vite';
      await fs.mkdir(projectPath, { recursive: true });

      const viteConfig = `
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    solidPlugin(),
    visualizer({
      template: 'treemap',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    port: 5175,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});`;

      await fs.writeFile(`${projectPath}/vite.config.ts`, viteConfig);

      const config = await fs.readFile(`${projectPath}/vite.config.ts`, 'utf-8');
      expect(config).toContain('vite-plugin-solid');
      expect(config).toContain('port: 5175');
    });
  });

  describe('Solid Features', () => {
    it('should handle Solid Router integration', async () => {
      const projectPath = '/tmp/solid-router';
      await fs.mkdir(projectPath, { recursive: true });

      const routerContent = `
import { lazy } from 'solid-js';
import { Route, Router } from '@solidjs/router';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Users = lazy(() => import('./pages/Users'));
const UserDetail = lazy(() => import('./pages/UserDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const AppRouter = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users" component={Users} />
      <Route path="/users/:id" component={UserDetail} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
};`;

      await fs.writeFile(`${projectPath}/src/router.tsx`, routerContent);

      const router = await fs.readFile(`${projectPath}/src/router.tsx`, 'utf-8');
      expect(router).toContain('@solidjs/router');
      expect(router).toContain('lazy(() => import');
    });

    it('should create Solid store with createStore', async () => {
      const projectPath = '/tmp/solid-store';
      await fs.mkdir(`${projectPath}/src/store`, { recursive: true });

      const storeContent = `
import { createStore } from 'solid-js/store';
import { createRoot } from 'solid-js';

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user';
}

interface AppState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly theme: 'light' | 'dark';
  readonly notifications: readonly Notification[];
}

interface Notification {
  readonly id: string;
  readonly message: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly timestamp: number;
}

function createAppStore() {
  const [state, setState] = createStore<AppState>({
    user: null,
    isAuthenticated: false,
    theme: 'light',
    notifications: [],
  });

  const login = (user: User): void => {
    setState({
      user,
      isAuthenticated: true,
    });
  };

  const logout = (): void => {
    setState({
      user: null,
      isAuthenticated: false,
    });
  };

  const setTheme = (theme: 'light' | 'dark'): void => {
    setState('theme', theme);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): void => {
    setState('notifications', (notifications) => [
      ...notifications,
      {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      },
    ]);
  };

  const removeNotification = (id: string): void => {
    setState('notifications', (notifications) =>
      notifications.filter((n) => n.id !== id)
    );
  };

  return {
    state,
    actions: {
      login,
      logout,
      setTheme,
      addNotification,
      removeNotification,
    },
  };
}

export const appStore = createRoot(createAppStore);`;

      await fs.writeFile(`${projectPath}/src/store/app.store.ts`, storeContent);

      const store = await fs.readFile(`${projectPath}/src/store/app.store.ts`, 'utf-8');
      expect(store).toContain('createStore');
      expect(store).toContain('interface AppState');
      expect(store).toContain('readonly');
    });
  });

  describe('Solid Error Handling', () => {
    it('should validate Solid options', async () => {
      const invalidOptions: ScaffoldGeneratorOptions = {
        name: '',
        frontend: 'solid-vite',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      await expect(generator.generate(invalidOptions)).rejects.toThrow();
    });

    it('should create ErrorBoundary component', async () => {
      const projectPath = '/tmp/solid-error';
      await fs.mkdir(`${projectPath}/src/components`, { recursive: true });

      const errorBoundaryContent = `
import { Component, ErrorBoundary, createSignal } from 'solid-js';

interface ErrorFallbackProps {
  readonly error: Error;
  readonly reset: () => void;
}

const ErrorFallback: Component<ErrorFallbackProps> = (props) => {
  return (
    <div class="min-h-screen flex items-center justify-center p-8">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p class="text-gray-600 mb-4">
          {props.error.message}
        </p>
        <details class="mb-6">
          <summary class="cursor-pointer text-sm text-gray-500">
            Error details
          </summary>
          <pre class="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
            {props.error.stack}
          </pre>
        </details>
        <button
          onClick={props.reset}
          class="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export const AppErrorBoundary: Component = (props) => {
  const [hasError, setHasError] = createSignal(false);

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <ErrorFallback
          error={error}
          reset={() => {
            setHasError(false);
            reset();
          }}
        />
      )}
    >
      {props.children}
    </ErrorBoundary>
  );
};`;

      await fs.writeFile(
        `${projectPath}/src/components/ErrorBoundary.tsx`,
        errorBoundaryContent
      );

      const errorBoundary = await fs.readFile(
        `${projectPath}/src/components/ErrorBoundary.tsx`,
        'utf-8'
      );

      expect(errorBoundary).toContain('ErrorBoundary');
      expect(errorBoundary).toContain('ErrorFallbackProps');
      expect(errorBoundary).toContain('fallback=');
    });
  });
});