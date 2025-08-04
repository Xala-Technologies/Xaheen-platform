/**
 * @fileoverview Comprehensive Tests for CoreAnalysisEngine
 * @description Tests for project analysis, quality assessment, and code insights
 * @version 1.0.0
 */

import { CoreAnalysisEngine } from "../../engines/CoreAnalysisEngine.js";
import {
	createMockFileSystem,
	createMockProject,
	expectAsyncThrow,
	mockAnalysisResults,
} from "../utils/test-helpers.js";

// Mock fs module
jest.mock("fs", () => ({
	readFileSync: jest.fn(),
	existsSync: jest.fn(),
	readdirSync: jest.fn(),
}));

// Mock glob module
jest.mock("glob", () => ({
	glob: jest.fn(),
}));

describe("CoreAnalysisEngine", () => {
	let engine: CoreAnalysisEngine;
	let mockProject: ReturnType<typeof createMockProject>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockProject = createMockProject("test-analysis-project");
		engine = new CoreAnalysisEngine(mockProject.root);
	});

	afterEach(() => {
		mockProject.cleanup();
	});

	describe("Constructor", () => {
		it("should initialize with project root path", () => {
			expect(engine).toBeInstanceOf(CoreAnalysisEngine);
		});

		it("should initialize patterns map", () => {
			// Access private property for testing (casting to any)
			const patterns = (engine as any).patterns;
			expect(patterns).toBeInstanceOf(Map);
			expect(patterns.size).toBeGreaterThan(0);
		});
	});

	describe("analyzeProject", () => {
		it("should perform comprehensive project analysis", async () => {
			const mockFs = createMockFileSystem();

			// Mock package.json
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "test-project",
					version: "1.0.0",
					dependencies: {
						react: "^18.2.0",
						next: "^14.0.0",
					},
					devDependencies: {
						typescript: "^5.0.0",
						jest: "^29.0.0",
					},
				}),
			);

			// Mock component files
			mockFs.files.set(
				`${mockProject.root}/src/components/Button.tsx`,
				`
        import React from 'react';
        
        interface ButtonProps {
          children: React.ReactNode;
          onClick?: () => void;
        }
        
        export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
          return <button onClick={onClick}>{children}</button>;
        };
      `,
			);

			// Mock fs functions
			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue(["Button.tsx", "Input.tsx"]);

			// Mock glob
			const { glob } = require("glob");
			glob.mockResolvedValue([
				`${mockProject.root}/src/components/Button.tsx`,
				`${mockProject.root}/src/components/Input.tsx`,
			]);

			const result = await engine.analyzeProject();

			expect(result).toHaveProperty("root", mockProject.root);
			expect(result).toHaveProperty("framework");
			expect(result).toHaveProperty("architecture");
			expect(result).toHaveProperty("components");
			expect(result).toHaveProperty("dependencies");
			expect(result).toHaveProperty("quality");

			expect(result.framework.name).toBe("Next.js");
			expect(result.framework.version).toBe("14.0.0");
			expect(result.components).toHaveLength(2);
		});

		it("should handle missing package.json gracefully", async () => {
			const mockFs = createMockFileSystem();
			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(() => false);

			await expectAsyncThrow(
				() => engine.analyzeProject(),
				"package.json not found",
			);
		});

		it("should analyze framework correctly for different frameworks", async () => {
			const mockFs = createMockFileSystem();

			// Test Vue.js detection
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "vue-project",
					dependencies: {
						vue: "^3.3.0",
						vite: "^4.0.0",
					},
				}),
			);

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue([]);

			const { glob } = require("glob");
			glob.mockResolvedValue([]);

			const result = await engine.analyzeProject();

			expect(result.framework.name).toBe("Vue.js");
			expect(result.framework.version).toBe("3.3.0");
			expect(result.framework.type).toBe("spa");
		});
	});

	describe("assessQuality", () => {
		it("should generate comprehensive quality assessment", async () => {
			const mockFs = createMockFileSystem();

			// Mock package.json and components
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "quality-test",
					dependencies: { react: "^18.2.0" },
				}),
			);

			mockFs.files.set(
				`${mockProject.root}/src/components/Button.tsx`,
				`
        import React from 'react';
        
        interface ButtonProps {
          children: React.ReactNode;
          onClick?: () => void;
          variant?: 'primary' | 'secondary';
        }
        
        export const Button: React.FC<ButtonProps> = ({ 
          children, 
          onClick, 
          variant = 'primary' 
        }) => {
          const handleClick = () => {
            if (onClick) {
              onClick();
            }
          };
          
          return (
            <button 
              onClick={handleClick}
              className={\`btn btn-\${variant}\`}
              aria-label="Interactive button"
            >
              {children}
            </button>
          );
        };
      `,
			);

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue(["Button.tsx"]);

			const { glob } = require("glob");
			glob.mockResolvedValue([`${mockProject.root}/src/components/Button.tsx`]);

			const result = await engine.assessQuality();

			expect(result).toHaveProperty("overall");
			expect(result).toHaveProperty("codeQuality");
			expect(result).toHaveProperty("security");
			expect(result).toHaveProperty("performance");
			expect(result).toHaveProperty("accessibility");
			expect(result).toHaveProperty("maintainability");
			expect(result).toHaveProperty("testCoverage");
			expect(result).toHaveProperty("documentation");

			expect(result.overall).toBeGreaterThan(0);
			expect(result.overall).toBeLessThanOrEqual(100);
			expect(result.accessibility).toBeGreaterThan(80); // Should detect aria-label
		});

		it("should assess code complexity correctly", async () => {
			const mockFs = createMockFileSystem();

			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "complexity-test",
					dependencies: { react: "^18.2.0" },
				}),
			);

			// Complex component with high cyclomatic complexity
			mockFs.files.set(
				`${mockProject.root}/src/components/Complex.tsx`,
				`
        import React, { useState } from 'react';
        
        export const Complex: React.FC = () => {
          const [state, setState] = useState(0);
          
          const complexFunction = (input: number) => {
            if (input > 10) {
              if (input > 20) {
                if (input > 30) {
                  return 'high';
                } else if (input > 25) {
                  return 'medium-high';
                } else {
                  return 'medium';
                }
              } else if (input > 15) {
                return 'low-medium';
              } else {
                return 'low';
              }
            } else if (input > 5) {
              return 'very-low';
            } else {
              return 'minimal';
            }
          };
          
          return <div>{complexFunction(state)}</div>;
        };
      `,
			);

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue(["Complex.tsx"]);

			const { glob } = require("glob");
			glob.mockResolvedValue([
				`${mockProject.root}/src/components/Complex.tsx`,
			]);

			const result = await engine.assessQuality();

			// Should detect high complexity
			expect(result.codeQuality).toBeLessThan(90);
			expect(result.maintainability).toBeLessThan(90);
		});
	});

	describe("Private Methods", () => {
		it("should extract component props correctly", () => {
			const content = `
        interface ButtonProps {
          children: React.ReactNode;
          onClick?: () => void;
          variant?: 'primary' | 'secondary';
          disabled?: boolean;
        }
      `;

			// Access private method for testing
			const props = (engine as any).extractProps(content);

			expect(props).toHaveLength(4);
			expect(props[0]).toMatchObject({
				name: "children",
				type: "React.ReactNode",
				optional: false,
			});
			expect(props[1]).toMatchObject({
				name: "onClick",
				type: "() => void",
				optional: true,
			});
		});

		it("should calculate cyclomatic complexity correctly", () => {
			const content = `
        function complexFunction(x: number): string {
          if (x > 10) {
            if (x > 20) {
              return 'high';
            } else {
              return 'medium';
            }
          } else if (x > 5) {
            return 'low';
          } else {
            return 'minimal';
          }
        }
      `;

			const complexity = (engine as any).calculateCyclomaticComplexity(content);

			// Should count: if, if, else, else if, else = 5 decision points + 1 = 6
			expect(complexity).toBe(6);
		});

		it("should determine component type correctly", () => {
			const pageContent = `
        export default function HomePage() {
          return <div>Home Page</div>;
        }
      `;

			const componentContent = `
        export const Button = () => {
          return <button>Click me</button>;
        }
      `;

			const hookContent = `
        export const useCounter = () => {
          const [count, setCount] = useState(0);
          return { count, setCount };
        }
      `;

			expect(
				(engine as any).determineComponentType(
					pageContent,
					"src/pages/HomePage.tsx",
				),
			).toBe("page");
			expect(
				(engine as any).determineComponentType(
					componentContent,
					"src/components/Button.tsx",
				),
			).toBe("component");
			expect(
				(engine as any).determineComponentType(
					hookContent,
					"src/hooks/useCounter.ts",
				),
			).toBe("hook");
		});

		it("should extract dependencies correctly", () => {
			const content = `
        import React, { useState, useEffect } from 'react';
        import { Button } from './Button';
        import axios from 'axios';
        import * as utils from '../utils';
      `;

			const dependencies = (engine as any).extractDependencies(content);

			expect(dependencies).toContain("react");
			expect(dependencies).toContain("./Button");
			expect(dependencies).toContain("axios");
			expect(dependencies).toContain("../utils");
		});

		it("should analyze accessibility features", () => {
			const goodAccessibilityContent = `
        <button 
          aria-label="Close dialog"
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <span aria-hidden="true">×</span>
        </button>
      `;

			const poorAccessibilityContent = `
        <div onClick={handleClick}>
          Click me
        </div>
      `;

			const goodResult = (engine as any).analyzeAccessibility(
				goodAccessibilityContent,
			);
			const poorResult = (engine as any).analyzeAccessibility(
				poorAccessibilityContent,
			);

			expect(goodResult.score).toBeGreaterThan(poorResult.score);
			expect(goodResult.score).toBeGreaterThan(80);
			expect(poorResult.score).toBeLessThan(50);
		});
	});

	describe("Error Handling", () => {
		it("should handle corrupted package.json", async () => {
			const mockFs = createMockFileSystem();
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				"invalid json content",
			);

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);

			await expectAsyncThrow(() => engine.analyzeProject(), "Unexpected token");
		});

		it("should handle empty project directory", async () => {
			const mockFs = createMockFileSystem();
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "empty-project",
					dependencies: {},
				}),
			);

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue([]);

			const { glob } = require("glob");
			glob.mockResolvedValue([]);

			const result = await engine.analyzeProject();

			expect(result.components).toHaveLength(0);
			expect(result.dependencies).toHaveLength(0);
			expect(result.framework.name).toBe("Unknown");
		});

		it("should handle file read errors gracefully", async () => {
			const mockFs = createMockFileSystem();
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "error-test",
					dependencies: { react: "^18.2.0" },
				}),
			);

			require("fs").readFileSync.mockImplementation((path: string) => {
				if (path.includes("Button.tsx")) {
					throw new Error("Permission denied");
				}
				return mockFs.readFileSync(path);
			});
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue(["Button.tsx"]);

			const { glob } = require("glob");
			glob.mockResolvedValue([`${mockProject.root}/src/components/Button.tsx`]);

			const result = await engine.analyzeProject();

			// Should continue analysis despite file read errors
			expect(result).toHaveProperty("components");
			expect(result.components).toHaveLength(0); // Failed to read component
		});
	});

	describe("Performance", () => {
		it("should complete analysis within reasonable time", async () => {
			const mockFs = createMockFileSystem();

			// Create a larger project structure
			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "performance-test",
					dependencies: { react: "^18.2.0" },
				}),
			);

			// Add multiple components
			for (let i = 0; i < 10; i++) {
				mockFs.files.set(
					`${mockProject.root}/src/components/Component${i}.tsx`,
					`
          import React from 'react';
          export const Component${i}: React.FC = () => <div>Component ${i}</div>;
        `,
				);
			}

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue(
				Array.from({ length: 10 }, (_, i) => `Component${i}.tsx`),
			);

			const { glob } = require("glob");
			glob.mockResolvedValue(
				Array.from(
					{ length: 10 },
					(_, i) => `${mockProject.root}/src/components/Component${i}.tsx`,
				),
			);

			const startTime = Date.now();
			const result = await engine.analyzeProject();
			const endTime = Date.now();

			expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
			expect(result.components).toHaveLength(10);
		});
	});

	describe("Integration", () => {
		it("should work with real-world component patterns", async () => {
			const mockFs = createMockFileSystem();

			mockFs.files.set(
				`${mockProject.root}/package.json`,
				JSON.stringify({
					name: "real-world-test",
					dependencies: {
						react: "^18.2.0",
						"@types/react": "^18.2.0",
						"styled-components": "^6.0.0",
					},
				}),
			);

			// Real-world component with hooks, styled-components, TypeScript
			mockFs.files.set(
				`${mockProject.root}/src/components/UserProfile.tsx`,
				`
        import React, { useState, useEffect, useCallback } from 'react';
        import styled from 'styled-components';
        
        interface User {
          id: string;
          name: string;
          email: string;
          avatar?: string;
        }
        
        interface UserProfileProps {
          userId: string;
          onUserUpdate?: (user: User) => void;
          showAvatar?: boolean;
          size?: 'small' | 'medium' | 'large';
        }
        
        const ProfileContainer = styled.div<{ size: string }>\`
          padding: \${({ size }) => size === 'large' ? '24px' : '16px'};
          border: 1px solid #e1e5e9;
          border-radius: 8px;
        \`;
        
        export const UserProfile: React.FC<UserProfileProps> = ({
          userId,
          onUserUpdate,
          showAvatar = true,
          size = 'medium'
        }) => {
          const [user, setUser] = useState<User | null>(null);
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState<string | null>(null);
          
          const fetchUser = useCallback(async () => {
            try {
              setLoading(true);
              const response = await fetch(\`/api/users/\${userId}\`);
              if (!response.ok) {
                throw new Error('Failed to fetch user');
              }
              const userData = await response.json();
              setUser(userData);
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
              setLoading(false);
            }
          }, [userId]);
          
          useEffect(() => {
            if (userId) {
              fetchUser();
            }
          }, [userId, fetchUser]);
          
          const handleUserEdit = useCallback(() => {
            if (user && onUserUpdate) {
              onUserUpdate(user);
            }
          }, [user, onUserUpdate]);
          
          if (loading) {
            return <div role="status" aria-label="Loading user profile">Loading...</div>;
          }
          
          if (error) {
            return (
              <div role="alert" aria-live="polite">
                Error loading user: {error}
              </div>
            );
          }
          
          if (!user) {
            return <div>User not found</div>;
          }
          
          return (
            <ProfileContainer size={size} data-testid="user-profile">
              {showAvatar && user.avatar && (
                <img 
                  src={user.avatar} 
                  alt={\`\${user.name}'s avatar\`}
                  width={size === 'large' ? 80 : 40}
                  height={size === 'large' ? 80 : 40}
                />
              )}
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <button 
                onClick={handleUserEdit}
                aria-label={\`Edit \${user.name}'s profile\`}
              >
                Edit Profile
              </button>
            </ProfileContainer>
          );
        };
      `,
			);

			require("fs").readFileSync.mockImplementation(mockFs.readFileSync);
			require("fs").existsSync.mockImplementation(mockFs.existsSync);
			require("fs").readdirSync.mockReturnValue(["UserProfile.tsx"]);

			const { glob } = require("glob");
			glob.mockResolvedValue([
				`${mockProject.root}/src/components/UserProfile.tsx`,
			]);

			const result = await engine.analyzeProject();

			expect(result.components).toHaveLength(1);

			const userProfileComponent = result.components[0];
			expect(userProfileComponent.name).toBe("UserProfile");
			expect(userProfileComponent.props).toContain("userId");
			expect(userProfileComponent.props).toContain("onUserUpdate");
			expect(userProfileComponent.props).toContain("showAvatar");
			expect(userProfileComponent.props).toContain("size");
			expect(userProfileComponent.state).toContain("user");
			expect(userProfileComponent.state).toContain("loading");
			expect(userProfileComponent.state).toContain("error");
			expect(userProfileComponent.dependencies).toContain("react");
			expect(userProfileComponent.dependencies).toContain("styled-components");

			// Should detect good accessibility practices
			expect(userProfileComponent.accessibility.score).toBeGreaterThan(85);

			// Should detect medium complexity due to multiple hooks and error handling
			expect(userProfileComponent.complexity.cyclomatic).toBeGreaterThan(5);
			expect(userProfileComponent.complexity.maintainabilityIndex).toBeLessThan(
				95,
			);
		});
	});
});
