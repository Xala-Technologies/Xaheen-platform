/**
 * NSM Classification System for Templates
 *
 * Norwegian Security Authority (NSM) classification system for template security levels.
 * Implements OPEN, RESTRICTED, CONFIDENTIAL, and SECRET classifications.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
import { consola } from "consola";
export class NSMClassifier {
    classifications = new Map();
    constructor() {
        this.initializeClassifications();
    }
    /**
     * Get classification metadata
     */
    getClassification(level) {
        return this.classifications.get(level) || null;
    }
    /**
     * Determine required classification based on data context
     */
    determineClassification(context) {
        // SECRET level indicators
        if (this.hasSecretIndicators(context)) {
            return "SECRET";
        }
        // CONFIDENTIAL level indicators
        if (this.hasConfidentialIndicators(context)) {
            return "CONFIDENTIAL";
        }
        // RESTRICTED level indicators
        if (this.hasRestrictedIndicators(context)) {
            return "RESTRICTED";
        }
        // Default to OPEN
        return "OPEN";
    }
    /**
     * Validate if user can access classification level
     */
    validateAccess(userClearance, requiredLevel) {
        const levels = [
            "OPEN",
            "RESTRICTED",
            "CONFIDENTIAL",
            "SECRET",
        ];
        const userLevel = levels.indexOf(userClearance);
        const requiredLevelIndex = levels.indexOf(requiredLevel);
        return userLevel >= requiredLevelIndex;
    }
    /**
     * Get security requirements for template
     */
    getSecurityRequirements(classification) {
        const metadata = this.getClassification(classification);
        if (!metadata) {
            throw new Error(`Unknown classification: ${classification}`);
        }
        return {
            templateSecurity: [
                "Add NSM classification headers to all files",
                "Include security audit trail in component metadata",
                "Implement proper access control patterns",
                ...(metadata.dataHandling.encryption
                    ? ["Add data encryption patterns"]
                    : []),
                ...(metadata.uiRequirements.watermarks
                    ? ["Add security watermarks"]
                    : []),
            ],
            runtimeSecurity: [
                "Implement session timeout management",
                "Add user authentication validation",
                "Include authorization pattern checks",
                ...(metadata.dataHandling.accessControl
                    ? ["Add role-based access control"]
                    : []),
                ...(metadata.uiRequirements.sessionTimeout < 60
                    ? ["Add enhanced session monitoring"]
                    : []),
            ],
            dataHandling: [
                "Implement proper data sanitization",
                "Add input validation patterns",
                "Include output encoding",
                ...(metadata.dataHandling.encryption
                    ? ["Add data encryption at rest and in transit"]
                    : []),
                ...(metadata.dataHandling.anonymization
                    ? ["Add data anonymization patterns"]
                    : []),
            ],
            auditRequirements: [
                "Add comprehensive audit logging",
                "Include user action tracking",
                "Implement change audit trails",
                ...(metadata.auditLevel === "maximum"
                    ? ["Add real-time security monitoring"]
                    : []),
                ...(metadata.dataHandling.auditTrail
                    ? ["Add detailed data access logging"]
                    : []),
            ],
        };
    }
    /**
     * Generate NSM-compliant template context
     */
    generateComplianceContext(classification) {
        const metadata = this.getClassification(classification);
        if (!metadata) {
            throw new Error(`Unknown classification: ${classification}`);
        }
        return {
            nsm: {
                classification,
                metadata,
                headers: this.generateNSMHeaders(classification),
                watermarks: metadata.uiRequirements.watermarks,
                sessionTimeout: metadata.uiRequirements.sessionTimeout,
                auditLevel: metadata.auditLevel,
                dataProtection: {
                    encryption: metadata.dataHandling.encryption,
                    auditTrail: metadata.dataHandling.auditTrail,
                    accessControl: metadata.dataHandling.accessControl,
                    retention: metadata.dataHandling.dataRetention,
                    anonymization: metadata.dataHandling.anonymization,
                },
            },
            gdpr: {
                lawfulBasis: this.getGDPRLawfulBasis(classification),
                dataMinimization: true,
                purposeLimitation: true,
                accuracyPrinciple: true,
                storageMinimization: metadata.dataHandling.dataRetention,
                integrityConfidentiality: true,
                accountability: true,
            },
            security: this.getSecurityRequirements(classification),
        };
    }
    /**
     * Generate NSM classification headers
     */
    generateNSMHeaders(classification) {
        const timestamp = new Date().toISOString();
        return {
            "X-NSM-Classification": classification,
            "X-Security-Level": classification,
            "X-Data-Classification": classification,
            "X-Generated-At": timestamp,
            "X-Compliance-Version": "1.0",
            "X-Norway-Compliant": "true",
            "X-GDPR-Compliant": "true",
        };
    }
    /**
     * Get GDPR lawful basis based on classification
     */
    getGDPRLawfulBasis(classification) {
        switch (classification) {
            case "SECRET":
            case "CONFIDENTIAL":
                return "vital-interests"; // For national security
            case "RESTRICTED":
                return "public-task"; // For public administration
            case "OPEN":
            default:
                return "legitimate-interests";
        }
    }
    /**
     * Check for SECRET level indicators
     */
    hasSecretIndicators(context) {
        const secretKeywords = [
            "national-security",
            "military",
            "intelligence",
            "classified",
            "state-secret",
            "defense",
            "counterintelligence",
        ];
        return (context.dataTypes?.some((type) => secretKeywords.some((keyword) => type.toLowerCase().includes(keyword))) || false);
    }
    /**
     * Check for CONFIDENTIAL level indicators
     */
    hasConfidentialIndicators(context) {
        const confidentialKeywords = [
            "personal-data",
            "medical",
            "financial",
            "biometric",
            "criminal-record",
            "government",
            "sensitive",
        ];
        return (context.dataTypes?.some((type) => confidentialKeywords.some((keyword) => type.toLowerCase().includes(keyword))) ||
            (context.retentionPeriod && context.retentionPeriod > 2555) ||
            false); // > 7 years
    }
    /**
     * Check for RESTRICTED level indicators
     */
    hasRestrictedIndicators(context) {
        const restrictedKeywords = [
            "internal",
            "employee",
            "business",
            "proprietary",
            "organizational",
            "administrative",
        ];
        return (context.dataTypes?.some((type) => restrictedKeywords.some((keyword) => type.toLowerCase().includes(keyword))) ||
            context.internationalTransfer ||
            false);
    }
    /**
     * Initialize NSM classifications
     */
    initializeClassifications() {
        // OPEN Classification
        this.classifications.set("OPEN", {
            level: "OPEN",
            description: "Information that can be freely shared with the public",
            requirements: [
                "Standard web security practices",
                "Basic input validation",
                "Standard logging",
            ],
            restrictions: [],
            auditLevel: "basic",
            dataHandling: {
                encryption: false,
                auditTrail: false,
                accessControl: false,
                dataRetention: 365, // 1 year
                anonymization: false,
            },
            uiRequirements: {
                watermarks: false,
                classificationLabels: false,
                restrictedActions: [],
                sessionTimeout: 480, // 8 hours
            },
            developmentRequirements: {
                codeReview: false,
                securityTesting: true,
                penetrationTesting: false,
                complianceValidation: true,
            },
        });
        // RESTRICTED Classification
        this.classifications.set("RESTRICTED", {
            level: "RESTRICTED",
            description: "Information for authorized personnel within the organization",
            requirements: [
                "User authentication required",
                "Role-based access control",
                "Enhanced logging and monitoring",
                "Data encryption in transit",
            ],
            restrictions: [
                "No public access",
                "Authenticated users only",
                "Internal network access only",
            ],
            auditLevel: "enhanced",
            dataHandling: {
                encryption: true,
                auditTrail: true,
                accessControl: true,
                dataRetention: 1095, // 3 years
                anonymization: false,
            },
            uiRequirements: {
                watermarks: true,
                classificationLabels: true,
                restrictedActions: ["export", "print", "screenshot"],
                sessionTimeout: 240, // 4 hours
            },
            developmentRequirements: {
                codeReview: true,
                securityTesting: true,
                penetrationTesting: false,
                complianceValidation: true,
            },
        });
        // CONFIDENTIAL Classification
        this.classifications.set("CONFIDENTIAL", {
            level: "CONFIDENTIAL",
            description: "Sensitive information requiring special handling and protection",
            requirements: [
                "Multi-factor authentication",
                "Strong encryption at rest and in transit",
                "Comprehensive audit trails",
                "Need-to-know access control",
                "Data loss prevention measures",
            ],
            restrictions: [
                "Authorized personnel only",
                "No international transfer without approval",
                "Special handling procedures required",
                "Background check required for access",
            ],
            auditLevel: "comprehensive",
            dataHandling: {
                encryption: true,
                auditTrail: true,
                accessControl: true,
                dataRetention: 2555, // 7 years
                anonymization: true,
            },
            uiRequirements: {
                watermarks: true,
                classificationLabels: true,
                restrictedActions: [
                    "export",
                    "print",
                    "screenshot",
                    "copy",
                    "download",
                ],
                sessionTimeout: 120, // 2 hours
            },
            developmentRequirements: {
                codeReview: true,
                securityTesting: true,
                penetrationTesting: true,
                complianceValidation: true,
            },
        });
        // SECRET Classification
        this.classifications.set("SECRET", {
            level: "SECRET",
            description: "Highly sensitive information critical to national security",
            requirements: [
                "Maximum security measures",
                "Hardware security modules",
                "Air-gapped systems when possible",
                "Continuous monitoring",
                "Real-time threat detection",
                "Quantum-resistant encryption",
            ],
            restrictions: [
                "Top Secret clearance required",
                "No international transfer",
                "Segregated systems only",
                "Physical security measures required",
                "Continuous monitoring required",
            ],
            auditLevel: "maximum",
            dataHandling: {
                encryption: true,
                auditTrail: true,
                accessControl: true,
                dataRetention: 10950, // 30 years
                anonymization: true,
            },
            uiRequirements: {
                watermarks: true,
                classificationLabels: true,
                restrictedActions: [
                    "export",
                    "print",
                    "screenshot",
                    "copy",
                    "download",
                    "share",
                ],
                sessionTimeout: 60, // 1 hour
            },
            developmentRequirements: {
                codeReview: true,
                securityTesting: true,
                penetrationTesting: true,
                complianceValidation: true,
            },
        });
        consola.debug("Initialized NSM classification system with 4 levels");
    }
}
// Singleton instance
export const nsmClassifier = new NSMClassifier();
//# sourceMappingURL=nsm-classifier.js.map