import { createServiceKey } from "./types.js";
import type { EventBus } from "../bus/index.js";
import type { NexusConfig } from "../config/index.js";
import type { LoggerFactory } from "../logging/index.js";

export const eventBus = createServiceKey<EventBus>("eventBus");
export const config = createServiceKey<NexusConfig>("config");
export const loggerFactory = createServiceKey<LoggerFactory>("loggerFactory");
