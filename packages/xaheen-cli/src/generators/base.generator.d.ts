export declare abstract class BaseGenerator<T = any> {
    protected logger: {
        info: (message: string, ...args: any[]) => void;
        success: (message: string, ...args: any[]) => void;
        warn: (message: string, ...args: any[]) => void;
        error: (message: string, error?: any) => void;
    };
    abstract generate(options: T): Promise<void>;
    protected validateOptions(options: T): Promise<void>;
}
//# sourceMappingURL=base.generator.d.ts.map