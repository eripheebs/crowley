import { URL } from "url";

interface ReporterConfig {
  outputFilePath: string;
}

interface CrawlerConfig {
  initialUrl: URL;
}

export interface Config {
  crawler: CrawlerConfig;
  reporter: ReporterConfig;
}
