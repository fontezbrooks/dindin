/**
 * Development-only logger utility
 * Replaces console.* statements for production safety
 * Automatically stripped in production builds
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerConfig {
	isDevelopment: boolean;
	logLevel: LogLevel;
	prefix?: string;
}

class Logger {
	private config: LoggerConfig;
	private levels: Record<LogLevel, number> = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	};

	constructor(config?: Partial<LoggerConfig>) {
		this.config = {
			isDevelopment: process.env.NODE_ENV !== "production",
			logLevel: (process.env.LOG_LEVEL as LogLevel) || "info",
			prefix: config?.prefix || "[DinDin]",
			...config,
		};
	}

	private shouldLog(level: LogLevel): boolean {
		if (!this.config.isDevelopment) return false;
		return this.levels[level] >= this.levels[this.config.logLevel];
	}

	private formatMessage(
		level: LogLevel,
		message: string,
		...args: any[]
	): void {
		if (!this.shouldLog(level)) return;

		const timestamp = new Date().toISOString();
		const prefix = `${this.config.prefix} [${timestamp}] [${level.toUpperCase()}]`;

		switch (level) {
			case "debug":
				console.debug(prefix, message, ...args);
				break;
			case "info":
				console.info(prefix, message, ...args);
				break;
			case "warn":
				console.warn(prefix, message, ...args);
				break;
			case "error":
				console.error(prefix, message, ...args);
				break;
		}
	}

	debug(message: string, ...args: any[]): void {
		this.formatMessage("debug", message, ...args);
	}

	info(message: string, ...args: any[]): void {
		this.formatMessage("info", message, ...args);
	}

	log(message: string, ...args: any[]): void {
		this.formatMessage("info", message, ...args);
	}

	warn(message: string, ...args: any[]): void {
		this.formatMessage("warn", message, ...args);
	}

	error(message: string, ...args: any[]): void {
		this.formatMessage("error", message, ...args);
	}

	// Safe method to log objects without exposing sensitive data
	logSafe(message: string, obj: any): void {
		if (!this.shouldLog("info")) return;

		const safeObj = this.sanitizeObject(obj);
		this.info(message, safeObj);
	}

	private sanitizeObject(obj: any): any {
		if (!obj) return obj;

		const sensitive = [
			"password",
			"token",
			"secret",
			"key",
			"auth",
			"authorization",
			"cookie",
			"session",
			"api_key",
			"apiKey",
			"private",
			"credential",
		];

		if (typeof obj !== "object") return obj;

		const sanitized: any = Array.isArray(obj) ? [] : {};

		for (const key in obj) {
			const lowerKey = key.toLowerCase();
			if (sensitive.some((s) => lowerKey.includes(s))) {
				sanitized[key] = "[REDACTED]";
			} else if (typeof obj[key] === "object" && obj[key] !== null) {
				sanitized[key] = this.sanitizeObject(obj[key]);
			} else {
				sanitized[key] = obj[key];
			}
		}

		return sanitized;
	}

	// Create child logger with additional prefix
	child(prefix: string): Logger {
		return new Logger({
			...this.config,
			prefix: `${this.config.prefix} ${prefix}`,
		});
	}
}

// Create singleton instance
const logger = new Logger();

// Export both default instance and class for custom instances
export { Logger };
export default logger;
