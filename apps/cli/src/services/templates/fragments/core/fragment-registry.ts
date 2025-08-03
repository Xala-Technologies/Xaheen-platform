/**
 * Fragment Registry Implementation
 * Manages registration, discovery, and compatibility checking of template fragments
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import { globby } from "globby";
import type {
  FragmentRegistry,
  FragmentConfig,
  FragmentType,
  TemplateContext,
  SupportedFramework,
  FragmentCompositionContext,
} from "../interfaces/fragment-base";

export class CoreFragmentRegistry implements FragmentRegistry {
  private readonly fragments = new Map<string, FragmentConfig>();
  private readonly fragmentPaths = new Map<string, string>();
  private initialized = false;

  constructor(private readonly basePath?: string) {
    this.basePath = basePath || this.getDefaultBasePath();
  }

  /**
   * Initialize the registry by scanning for fragments
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    consola.info("Initializing fragment registry...");
    
    try {
      await this.scanFragments();
      this.initialized = true;
      consola.success(`Fragment registry initialized with ${this.fragments.size} fragments`);
    } catch (error) {
      consola.error("Failed to initialize fragment registry:", error);
      throw new Error("Fragment registry initialization failed");
    }
  }

  /**
   * Register a fragment manually
   */
  async registerFragment(config: FragmentConfig): Promise<void> {
    await this.validateFragmentConfig(config);
    
    this.fragments.set(config.name, config);
    consola.debug(`Registered fragment: ${config.name}`);
  }

  /**
   * Get fragment by name
   */
  async getFragment(name: string): Promise<FragmentConfig | null> {
    await this.ensureInitialized();
    return this.fragments.get(name) || null;
  }

  /**
   * List available fragments with optional filtering
   */
  async listFragments(filter?: {
    type?: FragmentType;
    context?: TemplateContext;
    framework?: SupportedFramework;
  }): Promise<readonly FragmentConfig[]> {
    await this.ensureInitialized();
    
    let fragments = Array.from(this.fragments.values());

    if (filter) {
      fragments = fragments.filter(fragment => {
        if (filter.type && fragment.type !== filter.type) {
          return false;
        }
        
        if (filter.context && !fragment.context.includes(filter.context)) {
          return false;
        }
        
        if (filter.framework && !fragment.frameworks.includes(filter.framework)) {
          return false;
        }
        
        return true;
      });
    }

    return fragments.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Check compatibility between fragments
   */
  async checkCompatibility(
    fragmentNames: readonly string[],
    context: FragmentCompositionContext
  ): Promise<{
    compatible: boolean;
    conflicts: readonly string[];
    missing: readonly string[];
  }> {
    await this.ensureInitialized();

    const conflicts: string[] = [];
    const missing: string[] = [];
    const selectedFragments = new Map<string, FragmentConfig>();

    // Collect selected fragments
    for (const name of fragmentNames) {
      const fragment = this.fragments.get(name);
      if (!fragment) {
        missing.push(name);
        continue;
      }
      selectedFragments.set(name, fragment);
    }

    // Check for conflicts and missing dependencies
    for (const [name, fragment] of selectedFragments) {
      // Check framework compatibility
      if (!fragment.frameworks.includes(context.framework)) {
        conflicts.push(`${name}: incompatible with framework ${context.framework}`);
      }

      // Check context compatibility
      if (!fragment.context.includes(context.context)) {
        conflicts.push(`${name}: incompatible with context ${context.context}`);
      }

      // Check required dependencies
      if (fragment.compatibility?.requires) {
        for (const required of fragment.compatibility.requires) {
          if (!fragmentNames.includes(required)) {
            missing.push(`${name} requires ${required}`);
          }
        }
      }

      // Check conflicts
      if (fragment.compatibility?.conflicts) {
        for (const conflict of fragment.compatibility.conflicts) {
          if (fragmentNames.includes(conflict)) {
            conflicts.push(`${name} conflicts with ${conflict}`);
          }
        }
      }
    }

    // Check for mutual conflicts
    for (const [nameA, fragmentA] of selectedFragments) {
      for (const [nameB, fragmentB] of selectedFragments) {
        if (nameA !== nameB) {
          if (fragmentA.compatibility?.conflicts?.includes(nameB)) {
            conflicts.push(`${nameA} conflicts with ${nameB}`);
          }
        }
      }
    }

    return {
      compatible: conflicts.length === 0 && missing.length === 0,
      conflicts: [...new Set(conflicts)], // Remove duplicates
      missing: [...new Set(missing)], // Remove duplicates
    };
  }

  /**
   * Get fragment suggestions based on current selection
   */
  async getSuggestions(
    currentSelection: readonly string[],
    context: FragmentCompositionContext
  ): Promise<readonly string[]> {
    await this.ensureInitialized();

    const suggestions = new Set<string>();
    
    for (const fragmentName of currentSelection) {
      const fragment = this.fragments.get(fragmentName);
      if (fragment?.compatibility?.suggests) {
        for (const suggestion of fragment.compatibility.suggests) {
          if (!currentSelection.includes(suggestion) && this.fragments.has(suggestion)) {
            suggestions.add(suggestion);
          }
        }
      }
    }

    // Filter suggestions by compatibility
    const compatibleSuggestions: string[] = [];
    for (const suggestion of suggestions) {
      const testSelection = [...currentSelection, suggestion];
      const compatibility = await this.checkCompatibility(testSelection, context);
      if (compatibility.compatible) {
        compatibleSuggestions.push(suggestion);
      }
    }

    return compatibleSuggestions.sort();
  }

  /**
   * Scan for fragments in the base path
   */
  private async scanFragments(): Promise<void> {
    if (!(await fs.pathExists(this.basePath))) {
      consola.warn(`Fragment base path does not exist: ${this.basePath}`);
      return;
    }

    // Look for fragment.json files
    const fragmentConfigPaths = await globby("**/fragment.json", {
      cwd: this.basePath,
      absolute: true,
      onlyFiles: true,
    });

    consola.debug(`Found ${fragmentConfigPaths.length} fragment configurations`);

    for (const configPath of fragmentConfigPaths) {
      try {
        await this.loadFragmentFromPath(configPath);
      } catch (error) {
        consola.warn(`Failed to load fragment from ${configPath}:`, error);
      }
    }
  }

  /**
   * Load fragment configuration from file path
   */
  private async loadFragmentFromPath(configPath: string): Promise<void> {
    const configContent = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent) as FragmentConfig;
    
    await this.validateFragmentConfig(config);
    
    this.fragments.set(config.name, config);
    this.fragmentPaths.set(config.name, path.dirname(configPath));
    
    consola.debug(`Loaded fragment: ${config.name} from ${configPath}`);
  }

  /**
   * Validate fragment configuration
   */
  private async validateFragmentConfig(config: FragmentConfig): Promise<void> {
    const errors: string[] = [];

    if (!config.name || typeof config.name !== "string") {
      errors.push("Fragment name is required and must be a string");
    }

    if (!config.version || typeof config.version !== "string") {
      errors.push("Fragment version is required and must be a string");
    }

    if (!config.type || typeof config.type !== "string") {
      errors.push("Fragment type is required and must be a string");
    }

    if (!Array.isArray(config.context) || config.context.length === 0) {
      errors.push("Fragment context is required and must be a non-empty array");
    }

    if (!Array.isArray(config.frameworks) || config.frameworks.length === 0) {
      errors.push("Fragment frameworks is required and must be a non-empty array");
    }

    if (!Array.isArray(config.dependencies)) {
      errors.push("Fragment dependencies must be an array");
    }

    if (!Array.isArray(config.files)) {
      errors.push("Fragment files must be an array");
    }

    // Validate dependencies
    for (const [index, dep] of (config.dependencies || []).entries()) {
      if (!dep.name || typeof dep.name !== "string") {
        errors.push(`Dependency ${index}: name is required and must be a string`);
      }
      
      if (dep.type && !["dev", "peer", "runtime"].includes(dep.type)) {
        errors.push(`Dependency ${index}: type must be one of: dev, peer, runtime`);
      }
    }

    // Validate files
    for (const [index, file] of (config.files || []).entries()) {
      if (!file.path || typeof file.path !== "string") {
        errors.push(`File ${index}: path is required and must be a string`);
      }
      
      if (file.type && !["template", "static", "config"].includes(file.type)) {
        errors.push(`File ${index}: type must be one of: template, static, config`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Fragment validation failed: ${errors.join(", ")}`);
    }
  }

  /**
   * Ensure registry is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get default base path for fragments
   */
  private getDefaultBasePath(): string {
    return path.join(process.cwd(), "src", "services", "templates", "fragments", "library");
  }
}