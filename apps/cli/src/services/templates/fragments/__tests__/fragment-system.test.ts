/**
 * Fragment System Tests
 * Tests the core functionality of the template fragment system
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import path from "node:path";
import fs from "fs-extra";
import { FragmentService } from "../fragment-service";
import type { FragmentCompositionContext } from "../interfaces/fragment-base";

describe("Fragment System", () => {
  let fragmentService: FragmentService;
  let testOutputDir: string;

  beforeEach(async () => {
    testOutputDir = path.join(__dirname, "test-output");
    await fs.ensureDir(testOutputDir);
    
    // Use the library directory in our fragment system
    const libraryPath = path.join(__dirname, "..", "library");
    fragmentService = new FragmentService(libraryPath);
    await fragmentService.initialize();
  });

  afterEach(async () => {
    await fs.remove(testOutputDir);
  });

  describe("Fragment Discovery", () => {
    it("should discover auth fragments", async () => {
      const authFragments = await fragmentService.listFragments({ type: "auth" });
      
      expect(authFragments.length).toBeGreaterThan(0);
      
      const fragmentNames = authFragments.map(f => f.name);
      expect(fragmentNames).toContain("better-auth");
      expect(fragmentNames).toContain("clerk-auth");
    });

    it("should discover notification fragments", async () => {
      const notificationFragments = await fragmentService.listFragments({ type: "notification" });
      
      expect(notificationFragments.length).toBeGreaterThan(0);
      
      const fragmentNames = notificationFragments.map(f => f.name);
      expect(fragmentNames).toContain("resend-notifications");
      expect(fragmentNames).toContain("notification-toast");
    });

    it("should discover payment fragments", async () => {
      const paymentFragments = await fragmentService.listFragments({ type: "payment" });
      
      expect(paymentFragments.length).toBeGreaterThan(0);
      
      const fragmentNames = paymentFragments.map(f => f.name);
      expect(fragmentNames).toContain("stripe-payments");
    });

    it("should discover shared fragments", async () => {
      const sharedFragments = await fragmentService.listFragments({ type: "shared" });
      
      expect(sharedFragments.length).toBeGreaterThan(0);
      
      const fragmentNames = sharedFragments.map(f => f.name);
      expect(fragmentNames).toContain("ui-base");
      expect(fragmentNames).toContain("user-management");
    });
  });

  describe("Fragment Validation", () => {
    it("should validate compatible fragment selection", async () => {
      const validation = await fragmentService.validateFragmentSelection({
        fragmentNames: ["better-auth", "ui-base"],
        framework: "next",
        context: "web",
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect incompatible fragments", async () => {
      const validation = await fragmentService.validateFragmentSelection({
        fragmentNames: ["better-auth", "clerk-auth"],
        framework: "next",
        context: "web",
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(error => error.includes("conflicts"))).toBe(true);
    });

    it("should detect framework incompatibility", async () => {
      const validation = await fragmentService.validateFragmentSelection({
        fragmentNames: ["clerk-auth"],
        framework: "svelte", // Clerk doesn't support Svelte
        context: "web",
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => error.includes("framework"))).toBe(true);
    });
  });

  describe("Fragment Information", () => {
    it("should retrieve fragment information", async () => {
      const fragment = await fragmentService.getFragmentInfo("better-auth");
      
      expect(fragment).toBeDefined();
      expect(fragment?.name).toBe("better-auth");
      expect(fragment?.type).toBe("auth");
      expect(fragment?.frameworks).toContain("react");
      expect(fragment?.context).toContain("web");
    });

    it("should return null for non-existent fragment", async () => {
      const fragment = await fragmentService.getFragmentInfo("non-existent-fragment");
      expect(fragment).toBeNull();
    });
  });

  describe("Fragment Suggestions", () => {
    it("should suggest compatible fragments", async () => {
      const suggestions = await fragmentService.getFragmentSuggestions({
        currentSelection: ["better-auth"],
        framework: "next",
        context: "web",
      });

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("user-management");
    });
  });

  describe("Preview Generation", () => {
    it("should preview files for fragment selection", async () => {
      const preview = await fragmentService.previewGeneration({
        fragmentNames: ["ui-base"],
        projectConfig: {
          projectName: "test-project",
          framework: "next",
        },
        framework: "next",
        context: "web",
      });

      expect(preview.totalFiles).toBeGreaterThan(0);
      expect(preview.fragmentPreviews.length).toBe(1);
      expect(preview.fragmentPreviews[0].fragmentName).toBe("ui-base");
      expect(preview.totalDependencies.length).toBeGreaterThan(0);
    });
  });

  describe("Service Statistics", () => {
    it("should provide fragment statistics", async () => {
      const stats = await fragmentService.getStatistics();

      expect(stats.totalFragments).toBeGreaterThan(0);
      expect(stats.fragmentsByType.auth).toBeGreaterThan(0);
      expect(stats.fragmentsByType.notification).toBeGreaterThan(0);
      expect(stats.fragmentsByType.payment).toBeGreaterThan(0);
      expect(stats.fragmentsByType.shared).toBeGreaterThan(0);
    });
  });
});