/**
 * Phase 2 Unit Tests - Angular Preset
 * Tests for Angular preset logic with mocked file system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { vol } from 'memfs';
import { promises as fs } from 'fs';
import * as prompts from '@clack/prompts';
import { ScaffoldGenerator } from '../../../../src/generators/scaffold.generator';
import type { ScaffoldGeneratorOptions } from '../../../../src/generators/scaffold.generator';

// Mock modules
vi.mock('fs', async () => {
  const memfs = await vi.importActual<any>('memfs');
  return memfs.fs.promises;
});

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  spinner: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
    message: vi.fn(),
  }),
}));

describe('Phase 2: Angular Preset Unit Tests', () => {
  beforeEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Angular Project Generation', () => {
    it('should generate correct Angular project structure', async () => {
      const projectName = 'test-angular-app';
      const projectPath = `/tmp/${projectName}`;

      const options: ScaffoldGeneratorOptions = {
        name: projectName,
        frontend: 'angular',
        typescript: true,
        dryRun: false,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);

      // Verify Angular-specific files
      const files = vol.toJSON();
      const expectedFiles = [
        'package.json',
        'angular.json',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.spec.json',
        'src/main.ts',
        'src/app/app.module.ts',
        'src/app/app.component.ts',
      ];

      expectedFiles.forEach(file => {
        const fullPath = `${projectPath}/${file}`;
        expect(files[fullPath]).toBeDefined();
      });
    });

    it('should configure Angular with strict TypeScript', async () => {
      const projectPath = '/tmp/angular-strict';
      await fs.mkdir(projectPath, { recursive: true });

      const tsconfigContent = {
        compileOnSave: false,
        compilerOptions: {
          baseUrl: './',
          outDir: './dist/out-tsc',
          forceConsistentCasingInFileNames: true,
          strict: true,
          noImplicitOverride: true,
          noPropertyAccessFromIndexSignature: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          sourceMap: true,
          declaration: false,
          downlevelIteration: true,
          experimentalDecorators: true,
          moduleResolution: 'node',
          importHelpers: true,
          target: 'ES2022',
          module: 'ES2022',
          useDefineForClassFields: false,
          lib: ['ES2022', 'dom'],
        },
        angularCompilerOptions: {
          enableI18nLegacyMessageIdFormat: false,
          strictInjectionParameters: true,
          strictInputAccessModifiers: true,
          strictTemplates: true,
        },
      };

      await fs.writeFile(
        `${projectPath}/tsconfig.json`,
        JSON.stringify(tsconfigContent, null, 2)
      );

      const tsconfig = JSON.parse(
        await fs.readFile(`${projectPath}/tsconfig.json`, 'utf-8')
      );

      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(true);
    });

    it('should generate Angular module with proper typing', async () => {
      const projectPath = '/tmp/angular-module';
      await fs.mkdir(`${projectPath}/src/app`, { recursive: true });

      const moduleContent = `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`;

      await fs.writeFile(`${projectPath}/src/app/app.module.ts`, moduleContent);

      const module = await fs.readFile(`${projectPath}/src/app/app.module.ts`, 'utf-8');
      expect(module).toContain('@NgModule');
      expect(module).toContain('declarations:');
      expect(module).toContain('imports:');
    });

    it('should generate Angular component with TypeScript', async () => {
      const projectPath = '/tmp/angular-component';
      await fs.mkdir(`${projectPath}/src/app/components`, { recursive: true });

      const componentContent = `
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface UserData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user';
}

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  @Input() user!: UserData;
  @Output() userClicked = new EventEmitter<UserData>();
  @Output() userDeleted = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    if (!this.user) {
      throw new Error('User data is required');
    }
  }

  handleClick(): void {
    this.userClicked.emit(this.user);
  }

  handleDelete(): void {
    this.userDeleted.emit(this.user.id);
  }
}`;

      const templateContent = `
<div class="max-w-sm p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
  <div class="flex items-center space-x-4">
    <div class="flex-shrink-0">
      <div class="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
        <span class="text-white font-bold">{{ user.name.charAt(0) }}</span>
      </div>
    </div>
    <div class="flex-1">
      <h3 class="text-xl font-semibold text-gray-900">{{ user.name }}</h3>
      <p class="text-gray-600">{{ user.email }}</p>
      <span class="inline-block px-3 py-1 text-sm rounded-full"
            [ngClass]="{
              'bg-red-100 text-red-800': user.role === 'admin',
              'bg-blue-100 text-blue-800': user.role === 'user'
            }">
        {{ user.role }}
      </span>
    </div>
  </div>
  <div class="mt-6 flex space-x-4">
    <button (click)="handleClick()"
            class="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
      View Details
    </button>
    <button (click)="handleDelete()"
            class="h-12 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md">
      Delete
    </button>
  </div>
</div>`;

      await fs.writeFile(
        `${projectPath}/src/app/components/user-card.component.ts`,
        componentContent
      );
      await fs.writeFile(
        `${projectPath}/src/app/components/user-card.component.html`,
        templateContent
      );

      const component = await fs.readFile(
        `${projectPath}/src/app/components/user-card.component.ts`,
        'utf-8'
      );
      const template = await fs.readFile(
        `${projectPath}/src/app/components/user-card.component.html`,
        'utf-8'
      );

      expect(component).toContain('interface UserData');
      expect(component).toContain('readonly');
      expect(component).toContain('@Input() user!: UserData');
      expect(component).toContain('@Output()');
      expect(template).toContain('[ngClass]');
      expect(template).toContain('(click)=');
    });

    it('should generate Angular service with dependency injection', async () => {
      const projectPath = '/tmp/angular-service';
      await fs.mkdir(`${projectPath}/src/app/services`, { recursive: true });

      const serviceContent = `
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
}

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/api/users';

  constructor(private readonly http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(\`\${this.apiUrl}/\${id}\`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}`;

      await fs.writeFile(
        `${projectPath}/src/app/services/user.service.ts`,
        serviceContent
      );

      const service = await fs.readFile(
        `${projectPath}/src/app/services/user.service.ts`,
        'utf-8'
      );

      expect(service).toContain('@Injectable');
      expect(service).toContain('providedIn: \'root\'');
      expect(service).toContain('Observable<');
      expect(service).toContain('private readonly');
    });
  });

  describe('Angular Features', () => {
    it('should handle Angular Material selection', async () => {
      vi.mocked(prompts.confirm).mockResolvedValueOnce(true);

      const options: ScaffoldGeneratorOptions = {
        name: 'angular-material',
        frontend: 'angular',
        features: ['material'],
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.features).toContain('material');
    });

    it('should configure Angular routing', async () => {
      const projectPath = '/tmp/angular-routing';
      await fs.mkdir(`${projectPath}/src/app`, { recursive: true });

      const routingContent = `
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    enableTracing: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }`;

      await fs.writeFile(
        `${projectPath}/src/app/app-routing.module.ts`,
        routingContent
      );

      const routing = await fs.readFile(
        `${projectPath}/src/app/app-routing.module.ts`,
        'utf-8'
      );

      expect(routing).toContain('Routes');
      expect(routing).toContain('loadChildren:');
      expect(routing).toContain('canActivate:');
    });
  });

  describe('Angular Error Handling', () => {
    it('should validate Angular options', async () => {
      const invalidOptions: ScaffoldGeneratorOptions = {
        name: '',
        frontend: 'angular',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      await expect(generator.generate(invalidOptions)).rejects.toThrow();
    });

    it('should generate Angular error interceptor', async () => {
      const projectPath = '/tmp/angular-interceptor';
      await fs.mkdir(`${projectPath}/src/app/interceptors`, { recursive: true });

      const interceptorContent = `
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          this.router.navigate(['/unauthorized']);
        } else if (error.status >= 500) {
          console.error('Server error:', error);
        }
        
        return throwError(() => error);
      })
    );
  }
}`;

      await fs.writeFile(
        `${projectPath}/src/app/interceptors/error.interceptor.ts`,
        interceptorContent
      );

      const interceptor = await fs.readFile(
        `${projectPath}/src/app/interceptors/error.interceptor.ts`,
        'utf-8'
      );

      expect(interceptor).toContain('HttpInterceptor');
      expect(interceptor).toContain('HttpErrorResponse');
      expect(interceptor).toContain('catchError');
    });
  });
});