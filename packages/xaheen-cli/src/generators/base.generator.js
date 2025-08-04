export class BaseGenerator {
    logger = {
        info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
        success: (message, ...args) => console.log(`[SUCCESS] ${message}`, ...args),
        warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
        error: (message, error) => {
            console.error(`[ERROR] ${message}`);
            if (error) {
                console.error(error);
            }
        }
    };
    async validateOptions(options) {
        // Base validation logic - can be overridden by subclasses
    }
}
//# sourceMappingURL=base.generator.js.map