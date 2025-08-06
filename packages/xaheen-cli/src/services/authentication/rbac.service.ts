/**
 * @fileoverview Role-Based Access Control Service - EPIC 15 Story 15.2
 * @description Comprehensive RBAC implementation with granular permissions, role hierarchy, and Norwegian NSM compliance
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, Enterprise Security
 */

import { randomBytes } from "crypto";
import { z } from "zod";
import { logger } from "../../utils/logger";
import {
	RoleConfig,
	User,
	Permission,
	NSMClassification,
	AuthenticationEvent,
	AuthEventType,
	AuthenticationMethod,
	IRBACProvider,
	AuthorizationError
} from "./types.js";

// Role Assignment Schema
const RoleAssignmentSchema = z.object({
	id: z.string(),
	userId: z.string(),
	roleName: z.string(),
	assignedBy: z.string(),
	assignedAt: z.date(),
	expiresAt: z.date().optional(),
	isActive: z.boolean().default(true),
	metadata: z.record(z.any()).default({})
});

// Permission Check Result Schema
const PermissionCheckResultSchema = z.object({
	granted: z.boolean(),
	reason: z.string(),
	requiredClearance: z.nativeEnum(NSMClassification).optional(),
	userClearance: z.nativeEnum(NSMClassification),
	effectivePermissions: z.array(z.nativeEnum(Permission)),
	roleHierarchy: z.array(z.string()),
	metadata: z.record(z.any()).default({})
});

export type RoleAssignment = z.infer<typeof RoleAssignmentSchema>;
export type PermissionCheckResult = z.infer<typeof PermissionCheckResultSchema>;

/**
 * Enterprise Role-Based Access Control Service with Norwegian NSM compliance
 */
export class RBACService implements IRBACProvider {
	private readonly roles: Map<string, RoleConfig> = new Map();
	private readonly userRoles: Map<string, Set<RoleAssignment>> = new Map();
	private readonly roleHierarchy: Map<string, Set<string>> = new Map();
	private readonly permissionCache: Map<string, PermissionCheckResult> = new Map();
	private readonly auditEvents: AuthenticationEvent[] = [];

	constructor(initialRoles: RoleConfig[] = []) {
		this.initializeDefaultRoles();
		this.loadRoles(initialRoles);
		this.buildRoleHierarchy();
		this.startCacheCleanup();
		logger.info("RBAC Service initialized with Norwegian NSM compliance");
	}

	/**
	 * Check if user has specific permission
	 */
	async checkPermission(user: User, permission: Permission, resource?: any): Promise<boolean> {
		try {
			const result = await this.checkPermissionDetailed(user, permission, resource);
			
			// Log permission check
			await this.logRBACEvent({
				eventType: result.granted ? AuthEventType.LOGIN_SUCCESS : AuthEventType.PERMISSION_DENIED,
				userId: user.id,
				success: result.granted,
				failureReason: result.granted ? undefined : result.reason,
				metadata: {
					permission,
					userClearance: user.nsmClearance,
					effectivePermissions: result.effectivePermissions,
					roleHierarchy: result.roleHierarchy,
					resource: resource?.id || resource?.type
				}
			});

			return result.granted;

		} catch (error) {
			logger.error(`Permission check failed for user ${user.id}:`, error);
			
			await this.logRBACEvent({
				eventType: AuthEventType.PERMISSION_DENIED,
				userId: user.id,
				success: false,
				failureReason: error.message,
				metadata: { permission, error: error.toString() }
			});

			return false;
		}
	}

	/**
	 * Check permission with detailed result
	 */
	async checkPermissionDetailed(user: User, permission: Permission, resource?: any): Promise<PermissionCheckResult> {
		const cacheKey = `${user.id}:${permission}:${resource?.id || 'global'}`;
		
		// Check cache first (with 5-minute TTL)
		const cached = this.permissionCache.get(cacheKey);
		if (cached && (Date.now() - cached.metadata.cachedAt) < 300000) {
			return cached;
		}

		// Get user's effective permissions
		const effectivePermissions = await this.getUserPermissions(user.id);
		const userRoles = await this.getUserRoles(user.id);
		const roleHierarchy = userRoles.map(role => role.name);

		// Check basic permission
		let granted = effectivePermissions.includes(permission);
		let reason = granted ? "Permission granted" : "Permission not found in user roles";

		// Norwegian NSM security clearance check
		if (granted && resource?.nsmClassification) {
			const clearanceCheck = this.checkNSMClearance(user.nsmClearance, resource.nsmClassification);
			if (!clearanceCheck.granted) {
				granted = false;
				reason = clearanceCheck.reason;
			}
		}

		// Resource-specific permission checks
		if (granted && resource) {
			const resourceCheck = await this.checkResourcePermission(user, permission, resource);
			if (!resourceCheck.granted) {
				granted = false;
				reason = resourceCheck.reason;
			}
		}

		// Administrative override checks
		if (!granted) {
			const adminOverride = await this.checkAdminOverride(user, permission);
			if (adminOverride.granted) {
				granted = true;
				reason = adminOverride.reason;
			}
		}

		const result: PermissionCheckResult = {
			granted,
			reason,
			requiredClearance: resource?.nsmClassification,
			userClearance: user.nsmClearance,
			effectivePermissions,
			roleHierarchy,
			metadata: {
				cachedAt: Date.now(),
				resourceType: resource?.type,
				resourceId: resource?.id
			}
		};

		// Cache result
		this.permissionCache.set(cacheKey, result);

		return result;
	}

	/**
	 * Get user's roles
	 */
	async getUserRoles(userId: string): Promise<RoleConfig[]> {
		const assignments = this.userRoles.get(userId) || new Set();
		const activeAssignments = Array.from(assignments).filter(assignment => 
			assignment.isActive && 
			(!assignment.expiresAt || assignment.expiresAt > new Date())
		);

		const roles: RoleConfig[] = [];
		for (const assignment of activeAssignments) {
			const role = this.roles.get(assignment.roleName);
			if (role && role.isActive) {
				roles.push(role);
			}
		}

		// Include inherited roles
		const inheritedRoles = await this.getInheritedRoles(roles);
		return [...roles, ...inheritedRoles];
	}

	/**
	 * Get user's effective permissions (includes inherited permissions)
	 */
	async getUserPermissions(userId: string): Promise<Permission[]> {
		const userRoles = await this.getUserRoles(userId);
		const permissions = new Set<Permission>();

		// Collect permissions from all roles
		for (const role of userRoles) {
			for (const permission of role.permissions) {
				permissions.add(permission);
			}
		}

		// Add permissions from role inheritance
		for (const role of userRoles) {
			const inheritedPerms = await this.getInheritedPermissions(role);
			for (const permission of inheritedPerms) {
				permissions.add(permission);
			}
		}

		return Array.from(permissions);
	}

	/**
	 * Assign role to user
	 */
	async assignRole(
		userId: string, 
		roleName: string, 
		assignedBy: string = "system",
		expiresAt?: Date
	): Promise<void> {
		try {
			const role = this.roles.get(roleName);
			if (!role) {
				throw new AuthorizationError(
					`Role not found: ${roleName}`,
					"RBAC_ROLE_NOT_FOUND",
					404
				);
			}

			if (!role.isActive) {
				throw new AuthorizationError(
					`Role is inactive: ${roleName}`,
					"RBAC_ROLE_INACTIVE",
					400
				);
			}

			// Check if user already has this role
			const existingAssignments = this.userRoles.get(userId) || new Set();
			const hasRole = Array.from(existingAssignments).some(
				assignment => assignment.roleName === roleName && assignment.isActive
			);

			if (hasRole) {
				logger.warn(`User ${userId} already has role: ${roleName}`);
				return;
			}

			// Create role assignment
			const assignment: RoleAssignment = {
				id: this.generateAssignmentId(),
				userId,
				roleName,
				assignedBy,
				assignedAt: new Date(),
				expiresAt,
				isActive: true,
				metadata: {
					nsmClassification: role.nsmClassification,
					isSystemRole: role.isSystemRole
				}
			};

			// Add assignment
			if (!this.userRoles.has(userId)) {
				this.userRoles.set(userId, new Set());
			}
			this.userRoles.get(userId)!.add(assignment);

			// Clear permission cache for user
			this.clearUserPermissionCache(userId);

			// Log role assignment
			await this.logRBACEvent({
				eventType: AuthEventType.LOGIN_SUCCESS, // Using as role assignment success
				userId,
				success: true,
				metadata: {
					action: "role_assigned",
					roleName,
					assignedBy,
					expiresAt,
					nsmClassification: role.nsmClassification
				}
			});

			logger.success(`✅ Role ${roleName} assigned to user: ${userId}`);

		} catch (error) {
			logger.error(`Failed to assign role ${roleName} to user ${userId}:`, error);
			
			await this.logRBACEvent({
				eventType: AuthEventType.PERMISSION_DENIED,
				userId,
				success: false,
				failureReason: error.message,
				metadata: {
					action: "role_assignment_failed",
					roleName,
					error: error.toString()
				}
			});

			throw error;
		}
	}

	/**
	 * Revoke role from user
	 */
	async revokeRole(userId: string, roleName: string, revokedBy: string = "system"): Promise<void> {
		try {
			const assignments = this.userRoles.get(userId);
			if (!assignments) {
				logger.warn(`No roles found for user: ${userId}`);
				return;
			}

			// Find and deactivate role assignment
			let roleRevoked = false;
			for (const assignment of assignments) {
				if (assignment.roleName === roleName && assignment.isActive) {
					assignment.isActive = false;
					assignment.metadata.revokedBy = revokedBy;
					assignment.metadata.revokedAt = new Date();
					roleRevoked = true;
					break;
				}
			}

			if (!roleRevoked) {
				logger.warn(`Role ${roleName} not found for user: ${userId}`);
				return;
			}

			// Clear permission cache for user
			this.clearUserPermissionCache(userId);

			// Log role revocation
			await this.logRBACEvent({
				eventType: AuthEventType.LOGIN_SUCCESS, // Using as role revocation success
				userId,
				success: true,
				metadata: {
					action: "role_revoked",
					roleName,
					revokedBy
				}
			});

			logger.success(`✅ Role ${roleName} revoked from user: ${userId}`);

		} catch (error) {
			logger.error(`Failed to revoke role ${roleName} from user ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Create new role
	 */
	async createRole(role: RoleConfig): Promise<void> {
		try {
			// Validate role
			const validatedRole = RoleConfig.parse(role);

			// Check if role already exists
			if (this.roles.has(validatedRole.name)) {
				throw new AuthorizationError(
					`Role already exists: ${validatedRole.name}`,
					"RBAC_ROLE_EXISTS",
					409
				);
			}

			// Validate role inheritance
			for (const parentRole of validatedRole.inheritsFrom) {
				if (!this.roles.has(parentRole)) {
					throw new AuthorizationError(
						`Parent role not found: ${parentRole}`,
						"RBAC_PARENT_ROLE_NOT_FOUND",
						404
					);
				}
			}

			// Add role
			this.roles.set(validatedRole.name, validatedRole);

			// Update role hierarchy
			this.buildRoleHierarchy();

			// Clear all permission caches
			this.permissionCache.clear();

			logger.success(`✅ Role created: ${validatedRole.name}`);

		} catch (error) {
			logger.error(`Failed to create role ${role.name}:`, error);
			throw error;
		}
	}

	/**
	 * Update role
	 */
	async updateRole(roleName: string, updates: Partial<RoleConfig>): Promise<void> {
		try {
			const existingRole = this.roles.get(roleName);
			if (!existingRole) {
				throw new AuthorizationError(
					`Role not found: ${roleName}`,
					"RBAC_ROLE_NOT_FOUND",
					404
				);
			}

			// Merge updates
			const updatedRole = { ...existingRole, ...updates };
			
			// Validate updated role
			const validatedRole = RoleConfig.parse(updatedRole);

			// Update role
			this.roles.set(roleName, validatedRole);

			// Update role hierarchy if inheritance changed
			if (updates.inheritsFrom) {
				this.buildRoleHierarchy();
			}

			// Clear all permission caches
			this.permissionCache.clear();

			logger.success(`✅ Role updated: ${roleName}`);

		} catch (error) {
			logger.error(`Failed to update role ${roleName}:`, error);
			throw error;
		}
	}

	/**
	 * Delete role
	 */
	async deleteRole(roleName: string): Promise<void> {
		try {
			const role = this.roles.get(roleName);
			if (!role) {
				throw new AuthorizationError(
					`Role not found: ${roleName}`,
					"RBAC_ROLE_NOT_FOUND",
					404
				);
			}

			if (role.isSystemRole) {
				throw new AuthorizationError(
					`Cannot delete system role: ${roleName}`,
					"RBAC_SYSTEM_ROLE_UNDELETABLE",
					403
				);
			}

			// Check if role is in use
			const roleInUse = Array.from(this.userRoles.values()).some(assignments =>
				Array.from(assignments).some(assignment => 
					assignment.roleName === roleName && assignment.isActive
				)
			);

			if (roleInUse) {
				throw new AuthorizationError(
					`Cannot delete role in use: ${roleName}`,
					"RBAC_ROLE_IN_USE",
					409
				);
			}

			// Remove role
			this.roles.delete(roleName);

			// Update role hierarchy
			this.buildRoleHierarchy();

			// Clear all permission caches
			this.permissionCache.clear();

			logger.success(`✅ Role deleted: ${roleName}`);

		} catch (error) {
			logger.error(`Failed to delete role ${roleName}:`, error);
			throw error;
		}
	}

	// Private methods

	private initializeDefaultRoles(): void {
		const defaultRoles: RoleConfig[] = [
			{
				name: "admin",
				description: "System Administrator with full access",
				permissions: Object.values(Permission),
				inheritsFrom: [],
				nsmClassification: NSMClassification.SECRET,
				isSystemRole: true,
				isActive: true,
				metadata: { createdBy: "system", createdAt: new Date() }
			},
			{
				name: "developer",
				description: "Developer with CLI and project management permissions",
				permissions: [
					Permission.CLI_GENERATE,
					Permission.CLI_CREATE,
					Permission.PROJECT_READ,
					Permission.PROJECT_WRITE,
					Permission.TEMPLATE_READ,
					Permission.TEMPLATE_WRITE,
					Permission.SECURITY_SCAN
				],
				inheritsFrom: [],
				nsmClassification: NSMClassification.RESTRICTED,
				isSystemRole: true,
				isActive: true,
				metadata: { createdBy: "system", createdAt: new Date() }
			},
			{
				name: "viewer",
				description: "Read-only access to projects and templates",
				permissions: [
					Permission.PROJECT_READ,
					Permission.TEMPLATE_READ,
					Permission.COMPLIANCE_VIEW
				],
				inheritsFrom: [],
				nsmClassification: NSMClassification.OPEN,
				isSystemRole: true,
				isActive: true,
				metadata: { createdBy: "system", createdAt: new Date() }
			},
			{
				name: "security_officer",
				description: "Security operations and compliance management",
				permissions: [
					Permission.SECURITY_SCAN,
					Permission.SECURITY_AUDIT,
					Permission.SECURITY_ADMIN,
					Permission.COMPLIANCE_VIEW,
					Permission.COMPLIANCE_MANAGE,
					Permission.SYSTEM_MONITOR
				],
				inheritsFrom: ["viewer"],
				nsmClassification: NSMClassification.CONFIDENTIAL,
				isSystemRole: true,
				isActive: true,
				metadata: { createdBy: "system", createdAt: new Date() }
			}
		];

		for (const role of defaultRoles) {
			this.roles.set(role.name, role);
		}

		logger.info("✅ Default RBAC roles initialized");
	}

	private loadRoles(roles: RoleConfig[]): void {
		for (const role of roles) {
			try {
				const validatedRole = RoleConfig.parse(role);
				this.roles.set(validatedRole.name, validatedRole);
			} catch (error) {
				logger.error(`Failed to load role ${role.name}:`, error);
			}
		}
	}

	private buildRoleHierarchy(): void {
		this.roleHierarchy.clear();

		// Build inheritance hierarchy
		for (const [roleName, role] of this.roles) {
			for (const parentRoleName of role.inheritsFrom) {
				if (!this.roleHierarchy.has(parentRoleName)) {
					this.roleHierarchy.set(parentRoleName, new Set());
				}
				this.roleHierarchy.get(parentRoleName)!.add(roleName);
			}
		}

		logger.debug("Role hierarchy rebuilt");
	}

	private async getInheritedRoles(userRoles: RoleConfig[]): Promise<RoleConfig[]> {
		const inheritedRoles: RoleConfig[] = [];
		const visited = new Set<string>();

		for (const role of userRoles) {
			await this.collectInheritedRoles(role, inheritedRoles, visited);
		}

		return inheritedRoles;
	}

	private async collectInheritedRoles(
		role: RoleConfig, 
		collected: RoleConfig[], 
		visited: Set<string>
	): Promise<void> {
		for (const parentRoleName of role.inheritsFrom) {
			if (visited.has(parentRoleName)) {
				continue; // Prevent circular inheritance
			}

			visited.add(parentRoleName);
			const parentRole = this.roles.get(parentRoleName);
			
			if (parentRole && parentRole.isActive) {
				collected.push(parentRole);
				await this.collectInheritedRoles(parentRole, collected, visited);
			}
		}
	}

	private async getInheritedPermissions(role: RoleConfig): Promise<Permission[]> {
		const permissions = new Set<Permission>();
		const visited = new Set<string>();

		await this.collectInheritedPermissions(role, permissions, visited);

		return Array.from(permissions);
	}

	private async collectInheritedPermissions(
		role: RoleConfig,
		permissions: Set<Permission>,
		visited: Set<string>
	): Promise<void> {
		for (const parentRoleName of role.inheritsFrom) {
			if (visited.has(parentRoleName)) {
				continue; // Prevent circular inheritance
			}

			visited.add(parentRoleName);
			const parentRole = this.roles.get(parentRoleName);
			
			if (parentRole && parentRole.isActive) {
				for (const permission of parentRole.permissions) {
					permissions.add(permission);
				}
				await this.collectInheritedPermissions(parentRole, permissions, visited);
			}
		}
	}

	private checkNSMClearance(userClearance: NSMClassification, requiredClearance: NSMClassification): {
		granted: boolean;
		reason: string;
	} {
		const clearanceLevels = {
			[NSMClassification.OPEN]: 0,
			[NSMClassification.RESTRICTED]: 1,
			[NSMClassification.CONFIDENTIAL]: 2,
			[NSMClassification.SECRET]: 3
		};

		const userLevel = clearanceLevels[userClearance];
		const requiredLevel = clearanceLevels[requiredClearance];

		if (userLevel >= requiredLevel) {
			return {
				granted: true,
				reason: "NSM security clearance sufficient"
			};
		} else {
			return {
				granted: false,
				reason: `Insufficient NSM clearance. Required: ${requiredClearance}, User: ${userClearance}`
			};
		}
	}

	private async checkResourcePermission(
		user: User,
		permission: Permission,
		resource: any
	): Promise<{ granted: boolean; reason: string }> {
		// Implement resource-specific permission logic
		// This could check resource ownership, project membership, etc.
		
		// For now, implement basic checks
		if (resource.ownerId && resource.ownerId === user.id) {
			return {
				granted: true,
				reason: "Resource owner"
			};
		}

		// Check if user has explicit permission for this resource
		if (resource.permissions && resource.permissions[user.id]) {
			const resourcePermissions = resource.permissions[user.id];
			if (resourcePermissions.includes(permission)) {
				return {
					granted: true,
					reason: "Explicit resource permission"
				};
			}
		}

		return {
			granted: true, // Default to allow for now
			reason: "Default resource permission"
		};
	}

	private async checkAdminOverride(
		user: User,
		permission: Permission
	): Promise<{ granted: boolean; reason: string }> {
		// Check if user has admin role that can override permission checks
		const userRoles = await this.getUserRoles(user.id);
		const hasAdminRole = userRoles.some(role => 
			role.name === "admin" || 
			role.permissions.includes(Permission.SYSTEM_ADMIN)
		);

		if (hasAdminRole) {
			return {
				granted: true,
				reason: "Administrative override"
			};
		}

		return {
			granted: false,
			reason: "No administrative override available"
		};
	}

	private clearUserPermissionCache(userId: string): void {
		for (const [key] of this.permissionCache) {
			if (key.startsWith(`${userId}:`)) {
				this.permissionCache.delete(key);
			}
		}
	}

	private startCacheCleanup(): void {
		// Clean up expired cache entries every 10 minutes
		setInterval(() => {
			const now = Date.now();
			for (const [key, result] of this.permissionCache) {
				if ((now - result.metadata.cachedAt) > 600000) { // 10 minutes
					this.permissionCache.delete(key);
				}
			}
		}, 600000);
	}

	private generateAssignmentId(): string {
		return randomBytes(16).toString("hex");
	}

	private async logRBACEvent(eventData: Partial<AuthenticationEvent>): Promise<void> {
		const event: AuthenticationEvent = {
			eventId: randomBytes(16).toString("hex"),
			timestamp: new Date(),
			ipAddress: "CLI",
			userAgent: "Xaheen CLI",
			method: AuthenticationMethod.OAUTH2, // Default method
			nsmClassification: NSMClassification.OPEN,
			metadata: {},
			...eventData
		} as AuthenticationEvent;

		// Store audit event
		this.auditEvents.push(event);

		// Log to system
		logger.info("🔍 RBAC event:", event);
		
		// TODO: Integrate with audit logger service
	}

	/**
	 * Get audit events for reporting
	 */
	getAuditEvents(filters?: {
		userId?: string;
		startDate?: Date;
		endDate?: Date;
		eventType?: AuthEventType;
	}): AuthenticationEvent[] {
		let events = this.auditEvents;

		if (filters) {
			events = events.filter(event => {
				if (filters.userId && event.userId !== filters.userId) return false;
				if (filters.startDate && event.timestamp < filters.startDate) return false;
				if (filters.endDate && event.timestamp > filters.endDate) return false;
				if (filters.eventType && event.eventType !== filters.eventType) return false;
				return true;
			});
		}

		return events;
	}

	/**
	 * Get all roles
	 */
	getAllRoles(): RoleConfig[] {
		return Array.from(this.roles.values());
	}

	/**
	 * Get role by name
	 */
	getRole(roleName: string): RoleConfig | undefined {
		return this.roles.get(roleName);
	}
}