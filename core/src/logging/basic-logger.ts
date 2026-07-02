import type { LogLevel, LogRecord, LogSink, Logger, LoggerFactory } from "./types.js";

type ConsoleLike = Pick<Console, "log" | "warn" | "error">;

type BasicLoggerOptions = {
  minLevel?: LogLevel;
  sink?: LogSink;
  console?: ConsoleLike;
};

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_MIN_LEVEL: LogLevel = "info";

const DEFAULT_CONSOLE: ConsoleLike = console;

const createRecord = (
  level: LogLevel,
  component: string,
  message: string,
  context?: Record<string, unknown>,
): LogRecord => {
  const { correlationId, ...rest } = context ?? {};
  const hasContext = Object.keys(rest).length > 0;

  return {
    level,
    message,
    component,
    timestamp: new Date().toISOString(),
    ...(hasContext ? { context: rest } : {}),
    ...(typeof correlationId === "string" ? { correlationId } : {}),
  };
};

export class BasicLogger implements Logger {
  constructor(
    private readonly component: string,
    private readonly options: BasicLoggerOptions = {},
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.emit("error", message, context);
  }

  child(component: string): Logger {
    return new BasicLogger(this.joinComponent(component), this.options);
  }

  private emit(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const record = createRecord(level, this.component, message, context);
    const sink = this.options.sink ?? this.defaultSink();
    sink(record);
  }

  private shouldLog(level: LogLevel): boolean {
    const minLevel = this.options.minLevel ?? DEFAULT_MIN_LEVEL;
    return LEVEL_RANK[level] >= LEVEL_RANK[minLevel];
  }

  private defaultSink(): LogSink {
    const target = this.options.console ?? DEFAULT_CONSOLE;

    return (record) => {
      if (record.level === "warn") {
        target.warn(record);
        return;
      }

      if (record.level === "error") {
        target.error(record);
        return;
      }

      target.log(record);
    };
  }

  private joinComponent(childComponent: string): string {
    if (!this.component) {
      return childComponent;
    }

    if (!childComponent) {
      return this.component;
    }

    return `${this.component}.${childComponent}`;
  }
}

export class BasicLoggerFactory implements LoggerFactory {
  constructor(private readonly options: BasicLoggerOptions = {}) {}

  create(component: string): Logger {
    return new BasicLogger(component, this.options);
  }
}

export const createLogger = (
  component: string,
  options?: BasicLoggerOptions,
): Logger => new BasicLogger(component, options);
