export abstract class BaseGenerator<T = any> {
	protected logger = {
		info: (message: string, ...args: any[]) =>
			console.log(`[INFO] ${message}`, ...args),
		success: (message: string, ...args: any[]) =>
			console.log(`[SUCCESS] ${message}`, ...args),
		warn: (message: string, ...args: any[]) =>
			console.warn(`[WARN] ${message}`, ...args),
		error: (message: string, error?: any) => {
			console.error(`[ERROR] ${message}`);
			if (error) {
				console.error(error);
			}
		},
	};

	abstract generate(options: T): Promise<void>;

	protected async validateOptions(options: T): Promise<void> {
		// Base validation logic - can be overridden by subclasses
	}
}
