/**
 * Production-ready logging system
 * Environment-based log levels
 * Structured logging for better debugging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isDevelopment ? "debug" : "info");
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      if (this.isDevelopment) {
        console.debug(this.formatMessage("debug", message, context));
      }
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog("error")) {
      const errorContext = {
        ...context,
        ...(error instanceof Error
          ? {
              error: {
                name: error.name,
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined,
              },
            }
          : { error: String(error) }),
      };
      console.error(this.formatMessage("error", message, errorContext));
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, statusCode: number, duration?: number): void {
    const context: LogContext = {
      method,
      path,
      statusCode,
      ...(duration !== undefined && { duration: `${duration}ms` }),
    };

    if (statusCode >= 500) {
      this.error(`API Error: ${method} ${path}`, undefined, context);
    } else if (statusCode >= 400) {
      this.warn(`API Warning: ${method} ${path}`, context);
    } else {
      this.info(`API Request: ${method} ${path}`, context);
    }
  }

  /**
   * Log database operation
   */
  dbOperation(operation: string, model: string, context?: LogContext): void {
    this.debug(`DB ${operation}: ${model}`, context);
  }

  /**
   * Log authentication event
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, { userId, ...context });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
