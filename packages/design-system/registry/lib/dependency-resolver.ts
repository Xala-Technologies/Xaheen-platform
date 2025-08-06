/**
 * LEGO Block Dependency Resolution System
 * Automatically resolves and bundles component dependencies
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// =============================================================================
// DEPENDENCY GRAPH TYPES
// =============================================================================

export interface ComponentDependency {
  readonly name: string;
  readonly type: 'atom' | 'molecule' | 'organism' | 'template';
  readonly dependencies: string[];
  readonly peerDependencies: string[];
  readonly exports: string[];
  readonly bundle: {
    readonly gzipped: string;
    readonly dependencies_included: string[];
  };
  readonly api: {
    readonly props: string[];
    readonly variants?: string[];
    readonly sizes?: string[];
    readonly callbacks?: string[];
  };
  readonly v0_compatible: boolean;
  readonly copy_paste_ready: boolean;
}

export interface DependencyGraph {
  readonly components: Record<string, ComponentDependency>;
  readonly blocks: Record<string, ComponentDependency>;
  readonly tokens: Record<string, ComponentDependency>;
  readonly animations: Record<string, ComponentDependency>;
  readonly utilities: Record<string, ComponentDependency>;
}

// =============================================================================
// DEPENDENCY RESOLVER CLASS
// =============================================================================

export class DependencyResolver {
  private graph: DependencyGraph;
  
  constructor(dependencyPath?: string) {
    // Load dependency graph from JSON file
    const path = dependencyPath || join(__dirname, '../metadata/dependencies.json');
    try {
      const data = readFileSync(path, 'utf-8');
      this.graph = JSON.parse(data) as DependencyGraph;
    } catch (error) {
      console.warn('Could not load dependency graph:', error);
      this.graph = this.getDefaultGraph();
    }
  }

  /**
   * Resolve all dependencies for a component
   * Returns flat list of all required dependencies
   */
  resolveDependencies(componentName: string): string[] {
    const visited = new Set<string>();
    const resolved: string[] = [];

    const resolve = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const component = this.findComponent(name);
      if (!component) {
        console.warn(`Component '${name}' not found in dependency graph`);
        return;
      }

      // Resolve dependencies first (depth-first)
      component.dependencies.forEach(dep => resolve(dep));
      
      // Add current component
      resolved.push(name);
    };

    resolve(componentName);
    return resolved;
  }

  /**
   * Get dependency tree for a component
   * Returns hierarchical dependency structure
   */
  getDependencyTree(componentName: string): ComponentDependencyTree {
    const component = this.findComponent(componentName);
    if (!component) {
      throw new Error(`Component '${componentName}' not found`);
    }

    return {
      name: componentName,
      component,
      dependencies: component.dependencies.map(dep => this.getDependencyTree(dep))
    };
  }

  /**
   * Calculate total bundle size for a component and its dependencies
   */
  calculateBundleSize(componentName: string): BundleSizeInfo {
    const dependencies = this.resolveDependencies(componentName);
    let totalSize = 0;
    const breakdown: Record<string, string> = {};

    dependencies.forEach(dep => {
      const component = this.findComponent(dep);
      if (component) {
        const sizeStr = component.bundle.gzipped;
        const size = this.parseSizeString(sizeStr);
        totalSize += size;
        breakdown[dep] = sizeStr;
      }
    });

    return {
      total: this.formatSize(totalSize),
      breakdown,
      components: dependencies
    };
  }

  /**
   * Check if a component is compatible with v0
   */
  isV0Compatible(componentName: string): boolean {
    const component = this.findComponent(componentName);
    return component?.v0_compatible ?? false;
  }

  /**
   * Check if a component is copy-paste ready
   */
  isCopyPasteReady(componentName: string): boolean {
    const component = this.findComponent(componentName);
    return component?.copy_paste_ready ?? false;
  }

  /**
   * Get components that depend on a given component
   */
  getDependents(componentName: string): string[] {
    const dependents: string[] = [];
    
    this.getAllComponents().forEach(([name, component]) => {
      if (component.dependencies.includes(componentName)) {
        dependents.push(name);
      }
    });

    return dependents;
  }

  /**
   * Get optimal component bundle for an app
   * Suggests which components to bundle together
   */
  getOptimalBundle(requestedComponents: string[]): OptimalBundle {
    const allDeps = new Set<string>();
    const componentTrees: ComponentDependencyTree[] = [];

    // Collect all dependencies
    requestedComponents.forEach(comp => {
      const tree = this.getDependencyTree(comp);
      componentTrees.push(tree);
      
      const deps = this.resolveDependencies(comp);
      deps.forEach(dep => allDeps.add(dep));
    });

    // Calculate shared dependencies
    const depCounts: Record<string, number> = {};
    requestedComponents.forEach(comp => {
      const deps = this.resolveDependencies(comp);
      deps.forEach(dep => {
        depCounts[dep] = (depCounts[dep] || 0) + 1;
      });
    });

    const shared = Object.entries(depCounts)
      .filter(([_, count]) => count > 1)
      .map(([dep]) => dep);

    const bundleSize = this.calculateBundleSize(
      Array.from(allDeps).join(',')
    );

    return {
      requestedComponents,
      allDependencies: Array.from(allDeps),
      sharedDependencies: shared,
      bundleSize,
      trees: componentTrees,
      optimization: {
        canShareDependencies: shared.length > 0,
        estimatedSavings: this.calculateSavings(shared),
        recommendedStrategy: shared.length > 3 ? 'shared-bundle' : 'individual'
      }
    };
  }

  /**
   * Generate import statements for a component and its dependencies
   */
  generateImports(componentName: string, importStyle: 'named' | 'default' | 'namespace' = 'named'): string[] {
    const dependencies = this.resolveDependencies(componentName);
    const imports: string[] = [];

    dependencies.forEach(dep => {
      const component = this.findComponent(dep);
      if (!component) return;

      const exports = component.exports;
      const basePath = `@xaheen-ai/registry`;

      switch (importStyle) {
        case 'named':
          imports.push(`import { ${exports.join(', ')} } from '${basePath}';`);
          break;
        case 'namespace':
          imports.push(`import * as ${dep} from '${basePath}/${this.getComponentPath(dep)}';`);
          break;
        case 'default':
          imports.push(`import ${dep} from '${basePath}/${this.getComponentPath(dep)}';`);
          break;
      }
    });

    return imports;
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private findComponent(name: string): ComponentDependency | null {
    return (
      this.graph.components[name] ||
      this.graph.blocks[name] ||
      this.graph.tokens[name] ||
      this.graph.animations[name] ||
      this.graph.utilities[name] ||
      null
    );
  }

  private getAllComponents(): [string, ComponentDependency][] {
    const all: [string, ComponentDependency][] = [];
    
    Object.entries(this.graph.components).forEach(([name, comp]) => all.push([name, comp]));
    Object.entries(this.graph.blocks).forEach(([name, comp]) => all.push([name, comp]));
    Object.entries(this.graph.tokens).forEach(([name, comp]) => all.push([name, comp]));
    Object.entries(this.graph.animations).forEach(([name, comp]) => all.push([name, comp]));
    Object.entries(this.graph.utilities).forEach(([name, comp]) => all.push([name, comp]));

    return all;
  }

  private parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)(kb|mb|gb)$/i);
    if (!match) return 0;

    const [, size, unit] = match;
    const multipliers = { kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    return parseFloat(size) * (multipliers[unit.toLowerCase() as keyof typeof multipliers] || 1);
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}b`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
  }

  private calculateSavings(sharedDeps: string[]): string {
    const totalSharedSize = sharedDeps.reduce((acc, dep) => {
      const component = this.findComponent(dep);
      if (component) {
        acc += this.parseSizeString(component.bundle.gzipped);
      }
      return acc;
    }, 0);

    return this.formatSize(totalSharedSize * 0.7); // Estimated 70% savings
  }

  private getComponentPath(componentName: string): string {
    if (this.graph.components[componentName]) return `components/${componentName}`;
    if (this.graph.blocks[componentName]) return `blocks/${componentName}`;
    if (this.graph.tokens[componentName]) return `tokens/${componentName}`;
    if (this.graph.animations[componentName]) return `animations/${componentName}`;
    if (this.graph.utilities[componentName]) return `lib/${componentName}`;
    return componentName;
  }

  private getDefaultGraph(): DependencyGraph {
    return {
      components: {},
      blocks: {},
      tokens: {},
      animations: {},
      utilities: {}
    };
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface ComponentDependencyTree {
  readonly name: string;
  readonly component: ComponentDependency;
  readonly dependencies: ComponentDependencyTree[];
}

export interface BundleSizeInfo {
  readonly total: string;
  readonly breakdown: Record<string, string>;
  readonly components: string[];
}

export interface OptimalBundle {
  readonly requestedComponents: string[];
  readonly allDependencies: string[];
  readonly sharedDependencies: string[];
  readonly bundleSize: BundleSizeInfo;
  readonly trees: ComponentDependencyTree[];
  readonly optimization: {
    readonly canShareDependencies: boolean;
    readonly estimatedSavings: string;
    readonly recommendedStrategy: 'shared-bundle' | 'individual';
  };
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const dependencyResolver = new DependencyResolver();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Quick function to get component dependencies
 */
export const getDependencies = (componentName: string): string[] => {
  return dependencyResolver.resolveDependencies(componentName);
};

/**
 * Quick function to check v0 compatibility
 */
export const isV0Compatible = (componentName: string): boolean => {
  return dependencyResolver.isV0Compatible(componentName);
};

/**
 * Quick function to generate optimal bundle
 */
export const getOptimalBundle = (components: string[]): OptimalBundle => {
  return dependencyResolver.getOptimalBundle(components);
};