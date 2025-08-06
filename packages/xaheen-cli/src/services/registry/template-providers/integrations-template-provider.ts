/**
 * Integrations Template Provider
 *
 * Provides templates for third-party integrations, especially Norwegian services.
 * Single Responsibility: Integration templates only.
 */

import type { ServiceTemplate } from "../../../types/index";
import { BaseTemplateProvider } from "./base-template-provider";

export class AltinnTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("integrations", "altinn", "1.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"altinn",
			"Altinn integration for Norwegian digital services",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/services/altinn.ts",
					`import axios from 'axios';

export class AltinnService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ALTINN_BASE_URL || 'https://platform.altinn.no';
    this.apiKey = process.env.ALTINN_API_KEY || '';
  }

  async submitForm(formData: any) {
    try {
      const response = await axios.post(\`\${this.baseUrl}/storage/api/v1/instances\`, formData, {
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Altinn submission error:', error);
      throw error;
    }
  }
}`,
					100,
				),
			],
		};
	}
}

export class BankIDTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("integrations", "bankid", "1.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"bankid",
			"BankID integration for Norwegian identity verification",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/services/bankid.ts",
					`export class BankIDService {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.BANKID_CLIENT_ID || '';
    this.clientSecret = process.env.BANKID_CLIENT_SECRET || '';
  }

  async initiateAuth(redirectUri: string) {
    // BankID authentication logic
    return {
      authUrl: 'https://oidc.bankid.no/auth',
      state: Math.random().toString(36),
    };
  }

  async verifyToken(token: string) {
    // Token verification logic
    return { verified: true, userId: '12345678901' };
  }
}`,
					100,
				),
			],
		};
	}
}

export class VippsTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("integrations", "vipps", "1.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"vipps",
			"Vipps payment and login integration for Norwegian services",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/services/vipps.ts",
					`export class VippsService {
  private merchantSerialNumber: string;
  private subscriptionKey: string;

  constructor() {
    this.merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER || '';
    this.subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || '';
  }

  async initiatePayment(amount: number, orderId: string) {
    // Vipps payment initiation logic
    return {
      paymentUrl: 'https://apitest.vipps.no/ecomm/v2/payments',
      orderId,
      amount,
    };
  }

  async checkPaymentStatus(orderId: string) {
    // Payment status check logic
    return { status: 'RESERVED', orderId };
  }
}`,
					100,
				),
			],
		};
	}
}