import { URL } from "url";

interface ReporterConfig {
  outputFilePath: string;
}

interface CrawlerConfig {
  initialUrl: URL;
  maxTimeoutMs: number;
  pollIntervalMs: number;
}

interface TaskPoolConfig {
  maxConnections: number;
}

export interface Config {
  crawler: CrawlerConfig;
  reporter: ReporterConfig;
  resourcePool: TaskPoolConfig;
}
