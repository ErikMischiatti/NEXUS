import { describe, expect, it, vi } from "vitest";
import { BasicLogger, createLogger, type LogRecord } from "../src/index.js";

describe("BasicLogger", () => {
  it("emits debug, info, warn, and error records", () => {
    const records: LogRecord[] = [];
    const logger = createLogger("core", {
      minLevel: "debug",
      sink: (record) => {
        records.push(record);
      },
    });

    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");

    expect(records.map((record) => record.level)).toEqual([
      "debug",
      "info",
      "warn",
      "error",
    ]);
    expect(records.map((record) => record.component)).toEqual([
      "core",
      "core",
      "core",
      "core",
    ]);
  });

  it("filters below the minimum log level", () => {
    const records: LogRecord[] = [];
    const logger = createLogger("core", {
      minLevel: "warn",
      sink: (record) => {
        records.push(record);
      },
    });

    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");

    expect(records.map((record) => record.level)).toEqual(["warn", "error"]);
  });

  it("includes context and correlationId in structured records", () => {
    const records: LogRecord[] = [];
    const logger = createLogger("core", {
      minLevel: "debug",
      sink: (record) => {
        records.push(record);
      },
    });

    logger.info("payload received", {
      correlationId: "corr-123",
      requestId: "req-456",
    });

    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(
      expect.objectContaining({
        level: "info",
        message: "payload received",
        component: "core",
        correlationId: "corr-123",
        context: {
          requestId: "req-456",
        },
      }),
    );
    expect(typeof records[0].timestamp).toBe("string");
  });

  it("creates child loggers with component names", () => {
    const records: LogRecord[] = [];
    const logger = createLogger("core", {
      minLevel: "debug",
      sink: (record) => {
        records.push(record);
      },
    });

    const child = logger.child("plugin.alpha");
    child.warn("child message");

    expect(records).toHaveLength(1);
    expect(records[0].component).toBe("core.plugin.alpha");
  });

  it("writes structured records to the console by default", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const logger = new BasicLogger("core", { minLevel: "debug" });

      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");

      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          level: "debug",
          component: "core",
          message: "debug message",
        }),
      );
    } finally {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
