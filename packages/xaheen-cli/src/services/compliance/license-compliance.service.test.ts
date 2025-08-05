import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import { LicenseComplianceService, NorwegianLicensePolicy, LicenseType } from './license-compliance.service';

// Mock fs-extra
jest.mock('fs-extra');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('LicenseComplianceService', () => {
  let service: LicenseComplianceService;
  let mockPolicy: NorwegianLicensePolicy;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock policy
    mockPolicy = {
      organizationName: 'Test Norwegian Enterprise',
      organizationType: 'enterprise',
      procurementGuidelines: 'moderate',
      allowedLicenses: ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'ISC'],
      reviewRequiredLicenses: ['LGPL-2.1', 'LGPL-3.0', 'MPL-2.0'],
      prohibitedLicenses: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'],
      requireLegalReview: true,
      automaticScanning: true,
      generateSPDXReports: true,
      exportControlCompliance: true,
      gdprCompatibilityCheck: true,
      norwegianLanguageReporting: true,
      notificationSettings: {
        legalTeamEmail: 'legal@test.no',
        securityTeamEmail: 'security@test.no',
        emailNotifications: true,
      },
    };

    service = new LicenseComplianceService(mockPolicy);

    // Setup default fs mocks
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.ensureDir.mockResolvedValue();
    mockFs.writeJson.mockResolvedValue();
    mockFs.writeFile.mockResolvedValue();
    mockFs.readJson.mockResolvedValue({});
    mockFs.readFile.mockResolvedValue('');
  });

  describe('constructor', () => {
    it('should initialize with valid Norwegian policy', () => {
      expect(service).toBeInstanceOf(LicenseComplianceService);
    });

    it('should validate policy schema', () => {
      const invalidPolicy = {
        organizationName: '',
        organizationType: 'invalid' as any,
      };

      expect(() => {
        new LicenseComplianceService(invalidPolicy as any);
      }).toThrow();
    });
  });

  describe('performLicenseScan', () => {
    const mockProjectPath = '/test/project';

    beforeEach(() => {
      // Mock package.json detection
      mockFs.pathExists.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        return Promise.resolve(
          pathStr.includes('package.json') || 
          pathStr.includes('yarn.lock') ||
          pathStr.includes('composer.json')
        );
      });

      // Mock package.json content
      mockFs.readJson.mockResolvedValue({
        name: 'test-project',
        dependencies: {
          'react': '^18.0.0',
          'lodash': '^4.17.21',
          'express': '^4.18.0',
        },
        devDependencies: {
          'typescript': '^5.0.0',
        },
      });
    });

    it('should perform comprehensive license scan', async () => {
      const result = await service.performLicenseScan(mockProjectPath, {
        includeTransitive: true,
        scanSourceHeaders: false,
        generateSPDX: true,
        generateAttribution: true,
      });

      expect(result).toBeDefined();
      expect(result.scanId).toBeDefined();
      expect(result.projectPath).toBe(mockProjectPath);
      expect(result.packageManager).toContain('npm');
      expect(result.detectedLicenses).toBeDefined();
      expect(result.riskAssessment).toBeDefined();
    });

    it('should detect multiple package managers', async () => {
      mockFs.pathExists.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        return Promise.resolve(
          pathStr.includes('package.json') ||
          pathStr.includes('yarn.lock') ||
          pathStr.includes('composer.json') ||
          pathStr.includes('requirements.txt')
        );
      });

      const result = await service.performLicenseScan(mockProjectPath);
      
      expect(result.packageManager.length).toBeGreaterThan(1);
      expect(result.packageManager).toContain('npm');
      expect(result.packageManager).toContain('yarn');
      expect(result.packageManager).toContain('composer');
      expect(result.packageManager).toContain('pip');
    });

    it('should identify prohibited licenses', async () => {
      // Mock detection of GPL license
      mockFs.readJson.mockResolvedValue({
        name: 'gpl-package',
        dependencies: {
          'some-gpl-package': '^1.0.0',
        },
      });

      // Mock node_modules package.json with GPL license
      mockFs.readJson.mockImplementation((filePath: string) => {
        if (filePath.toString().includes('some-gpl-package/package.json')) {
          return Promise.resolve({
            name: 'some-gpl-package',
            license: 'GPL-3.0',
          });
        }
        return Promise.resolve({
          name: 'test-project',
          dependencies: { 'some-gpl-package': '^1.0.0' },
        });
      });

      const result = await service.performLicenseScan(mockProjectPath);
      
      const criticalIssues = result.complianceIssues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBeGreaterThan(0);
      expect(criticalIssues[0].type).toBe('prohibited_license');
    });

    it('should generate SPDX document when requested', async () => {
      const result = await service.performLicenseScan(mockProjectPath, {
        generateSPDX: true,
      });

      expect(result.spdxDocument).toBeDefined();
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('SPDX-License-Report.json'),
        expect.objectContaining({
          spdxVersion: 'SPDX-2.3',
          dataLicense: 'CC0-1.0',
        }),
        { spaces: 2 }
      );
    });

    it('should generate attribution document when requested', async () => {
      const result = await service.performLicenseScan(mockProjectPath, {
        generateAttribution: true,
      });

      expect(result.attributionDocument).toBeDefined();
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('THIRD-PARTY-NOTICES.md'),
        expect.stringContaining('Third-Party Notices')
      );
    });
  });

  describe('risk assessment', () => {
    it('should assess MIT license as acceptable risk', () => {
      const riskLevel = (service as any).assessLicenseRisk(['MIT']);
      expect(riskLevel).toBe('ACCEPTABLE');
    });

    it('should assess GPL license as prohibited risk', () => {
      const riskLevel = (service as any).assessLicenseRisk(['GPL-3.0']);
      expect(riskLevel).toBe('PROHIBITED');
    });

    it('should assess UNKNOWN license as medium risk', () => {
      const riskLevel = (service as any).assessLicenseRisk(['UNKNOWN']);
      expect(riskLevel).toBe('MEDIUM_RISK');
    });

    it('should assess AGPL license as prohibited', () => {
      const riskLevel = (service as any).assessLicenseRisk(['AGPL-3.0']);
      expect(riskLevel).toBe('PROHIBITED');
    });
  });

  describe('license parsing', () => {
    it('should parse MIT license string correctly', () => {
      const licenses = (service as any).parseLicenseString('MIT');
      expect(licenses).toEqual(['MIT']);
    });

    it('should parse Apache license string correctly', () => {
      const licenses = (service as any).parseLicenseString('Apache-2.0');
      expect(licenses).toEqual(['Apache-2.0']);
    });

    it('should parse complex license string', () => {
      const licenses = (service as any).parseLicenseString('(MIT OR Apache-2.0)');
      expect(licenses).toContain('MIT');
      expect(licenses).toContain('Apache-2.0');
    });

    it('should handle unknown license strings', () => {
      const licenses = (service as any).parseLicenseString('Some-Custom-License');
      expect(licenses).toEqual(['UNKNOWN']);
    });

    it('should handle empty license strings', () => {
      const licenses = (service as any).parseLicenseString('');
      expect(licenses).toEqual(['UNKNOWN']);
    });
  });

  describe('license conflicts', () => {
    it('should detect GPL-proprietary conflicts', () => {
      const mockLicenses = [
        {
          name: 'gpl-package',
          licenses: ['GPL-3.0'],
          path: '/test',
          licenseFiles: [],
          confidence: 90,
          source: 'package.json' as const,
          riskLevel: 'HIGH_RISK' as const,
          isTransitive: false,
        },
        {
          name: 'proprietary-package',
          licenses: ['Proprietary'],
          path: '/test',
          licenseFiles: [],
          confidence: 90,
          source: 'package.json' as const,
          riskLevel: 'HIGH_RISK' as const,
          isTransitive: false,
        },
      ];

      const conflicts = (service as any).analyzeLicenseConflicts(mockLicenses);
      
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].severity).toBe('critical');
      expect(conflicts[0].description).toContain('GPL license contamination');
    });

    it('should detect incompatible license combinations', () => {
      const mockLicenses = [
        {
          name: 'mit-package',
          licenses: ['MIT'],
          path: '/test',
          licenseFiles: [],
          confidence: 90,
          source: 'package.json' as const,
          riskLevel: 'ACCEPTABLE' as const,
          isTransitive: false,
        },
        {
          name: 'gpl2-package',
          licenses: ['GPL-2.0'],
          path: '/test',
          licenseFiles: [],
          confidence: 90,
          source: 'package.json' as const,
          riskLevel: 'HIGH_RISK' as const,
          isTransitive: false,
        },
      ];

      const conflicts = (service as any).analyzeLicenseConflicts(mockLicenses);
      
      expect(conflicts.some(c => c.description.includes('Incompatible license combination'))).toBe(true);
    });
  });

  describe('Norwegian compliance', () => {
    it('should generate Norwegian-specific recommendations for government organizations', () => {
      const governmentPolicy = {
        ...mockPolicy,
        organizationType: 'government' as const,
      };

      const governmentService = new LicenseComplianceService(governmentPolicy);
      
      const mockDetectedLicenses = [
        {
          name: 'test-package',
          licenses: ['MIT'],
          path: '/test',
          licenseFiles: [],
          confidence: 90,
          source: 'package.json' as const,
          riskLevel: 'ACCEPTABLE' as const,
          isTransitive: false,
        },
      ];

      const recommendations = (governmentService as any).generateRecommendations(
        mockDetectedLicenses,
        [],
        {
          overallRisk: 'ACCEPTABLE',
          copyleftRisk: 0,
          commercialRisk: 0,
          exportControlRisk: 0,
          norwegianComplianceRisk: 0,
          riskFactors: [],
          mitigationStrategies: [],
        }
      );

      expect(recommendations.some(r => r.norwegianContext.includes('norske'))).toBe(true);
      expect(recommendations.some(r => r.implementation.some(i => i.includes('Norwegian')))).toBe(true);
    });

    it('should include Norwegian legal references in compliance issues', async () => {
      // Mock detection of prohibited license
      mockFs.readJson.mockResolvedValue({
        name: 'prohibited-package',
        dependencies: {
          'gpl-package': '^1.0.0',
        },
      });

      mockFs.readJson.mockImplementation((filePath: string) => {
        if (filePath.toString().includes('gpl-package/package.json')) {
          return Promise.resolve({
            name: 'gpl-package',
            license: 'GPL-3.0',
          });
        }
        return Promise.resolve({
          name: 'prohibited-package',
          dependencies: { 'gpl-package': '^1.0.0' },
        });
      });

      const result = await service.performLicenseScan('/test/project');
      
      const issues = result.complianceIssues;
      expect(issues.some(i => i.norwegianLegalReference.includes('norske'))).toBe(true);
    });
  });

  describe('export and reporting', () => {
    it('should export scan results to JSON', async () => {
      const mockScanResult = {
        scanId: 'test-scan-123',
        scanDate: new Date(),
        projectPath: '/test/project',
        packageManager: ['npm'] as const,
        totalPackages: 5,
        licensedPackages: 4,
        unlicensedPackages: 1,
        detectedLicenses: [],
        licenseConflicts: [],
        complianceIssues: [],
        riskAssessment: {
          overallRisk: 'ACCEPTABLE' as const,
          copyleftRisk: 0,
          commercialRisk: 0,
          exportControlRisk: 0,
          norwegianComplianceRisk: 0,
          riskFactors: [],
          mitigationStrategies: [],
        },
        recommendedActions: [],
      };

      const outputPath = await service.exportScanResults(mockScanResult);
      
      expect(outputPath).toContain('license-scan-test-scan-123.json');
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('license-scan-test-scan-123.json'),
        mockScanResult,
        { spaces: 2 }
      );
    });

    it('should generate comprehensive compliance report', async () => {
      const mockScanResult = {
        scanId: 'test-scan-123',
        scanDate: new Date(),
        projectPath: '/test/project',
        packageManager: ['npm'] as const,
        totalPackages: 5,
        licensedPackages: 4,
        unlicensedPackages: 1,
        detectedLicenses: [
          {
            name: 'test-package',
            licenses: ['MIT'],
            path: '/test',
            licenseFiles: [],
            confidence: 90,
            source: 'package.json' as const,
            riskLevel: 'ACCEPTABLE' as const,
            isTransitive: false,
          },
        ],
        licenseConflicts: [],
        complianceIssues: [],
        riskAssessment: {
          overallRisk: 'ACCEPTABLE' as const,
          copyleftRisk: 0,
          commercialRisk: 0,
          exportControlRisk: 0,
          norwegianComplianceRisk: 0,
          riskFactors: [],
          mitigationStrategies: [],
        },
        recommendedActions: [],
      };

      const reportPath = await service.generateComplianceReport(mockScanResult);
      
      expect(reportPath).toContain('compliance-report-test-scan-123.md');
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('compliance-report-test-scan-123.md'),
        expect.stringContaining('License Compliance Report')
      );
    });
  });

  describe('deep scan capabilities', () => {
    beforeEach(() => {
      // Mock exec for license-checker
      const { exec } = require('child_process');
      (exec as jest.Mock).mockImplementation((command: string, callback: Function) => {
        if (command.includes('license-checker')) {
          callback(null, {
            stdout: JSON.stringify({
              'react@18.0.0': {
                licenses: 'MIT',
                path: '/node_modules/react',
                licenseFile: '/node_modules/react/LICENSE',
              },
              'lodash@4.17.21': {
                licenses: 'MIT',
                path: '/node_modules/lodash',
                licenseFile: '/node_modules/lodash/LICENSE',
              },
            }),
          });
        } else {
          callback(new Error('Command not found'));
        }
      });
    });

    it('should perform deep scan with license-checker', async () => {
      const result = await service.performLicenseScan('/test/project', {
        deepScan: true,
      });

      expect(result.detectedLicenses.length).toBeGreaterThan(0);
      expect(result.detectedLicenses[0].confidence).toBeGreaterThan(90);
    });
  });

  describe('source header scanning', () => {
    beforeEach(() => {
      // Mock find command for source files
      const { exec } = require('child_process');
      (exec as jest.Mock).mockImplementation((command: string, callback: Function) => {
        if (command.includes('find')) {
          callback(null, {
            stdout: '/test/project/src/index.js\n/test/project/src/component.tsx',
          });
        } else {
          callback(new Error('Command not found'));
        }
      });

      // Mock file reading for source headers
      mockFs.readFile.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('index.js')) {
          return Promise.resolve(`
/**
 * Copyright (c) 2024 Test Company
 * Licensed under the MIT License
 */

const app = {};
          `);
        } else if (pathStr.includes('component.tsx')) {
          return Promise.resolve(`
/*
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
          `);
        }
        return Promise.resolve('');
      });
    });

    it('should scan source headers for license declarations', async () => {
      const result = await service.performLicenseScan('/test/project', {
        scanSourceHeaders: true,
      });

      const sourceHeaderLicenses = result.detectedLicenses.filter(dl => dl.source === 'source-header');
      expect(sourceHeaderLicenses.length).toBeGreaterThan(0);
    });
  });

  describe('CI/CD integration', () => {
    it('should provide exit codes based on risk level', async () => {
      // Mock high-risk scenario
      mockFs.readJson.mockResolvedValue({
        name: 'high-risk-project',
        dependencies: {
          'gpl-package': '^1.0.0',
        },
      });

      mockFs.readJson.mockImplementation((filePath: string) => {
        if (filePath.toString().includes('gpl-package/package.json')) {
          return Promise.resolve({
            name: 'gpl-package',
            license: 'GPL-3.0',
          });
        }
        return Promise.resolve({
          name: 'high-risk-project',
          dependencies: { 'gpl-package': '^1.0.0' },
        });
      });

      const result = await service.performLicenseScan('/test/project');
      
      // High risk should trigger CI/CD failure
      expect(['HIGH_RISK', 'PROHIBITED']).toContain(result.riskAssessment.overallRisk);
      expect(result.complianceIssues.some(i => i.severity === 'critical')).toBe(true);
    });
  });
});