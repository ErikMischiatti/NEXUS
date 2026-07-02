export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown> & {
  correlationId?: string;
};

export type LogRecord = {
  level: LogLevel;
  message: string;
  component: string;
  timestamp: string;
  context?: Record<string, unknown>;
  correlationId?: string;
};

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(component: string): Logger;
}

export interface LoggerFactory {
  create(component: string): Logger;
}

export type LogSink = (record: LogRecord) => void;
