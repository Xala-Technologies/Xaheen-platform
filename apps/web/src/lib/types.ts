export type TechCategory =
	| "api"
	| "webFrontend"
	| "nativeFrontend"
	| "runtime"
	| "backend"
	| "database"
	| "orm"
	| "dbSetup"
	| "webDeploy"
	| "auth"
	| "packageManager"
	| "uiSystem"
	| "compliance"
	| "addons"
	| "notifications"
	| "documents"
	| "payments"
	| "analytics"
	| "monitoring"
	| "messaging"
	| "testing"
	| "devops"
	| "search"
	| "caching"
	| "backgroundJobs"
	| "i18n"
	| "cms"
	| "security"
	| "examples"
	| "git"
	| "install";

export interface TechEdge {
	id: string;
	source: string;
	target: string;
	type?: string;
	animated?: boolean;
}

export interface Sponsor {
	sponsor: {
		login: string;
		name: string;
		avatarUrl: string;
		websiteUrl?: string;
		linkUrl: string;
		customLogoUrl: string;
		type: string;
	};
	isOneTime: boolean;
	monthlyDollars: number;
	privacyLevel: string;
	tierName: string;
	createdAt: string;
	provider: string;
}
