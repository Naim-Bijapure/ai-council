import type { AppKey, SupportedApp } from "./types";

export type AutomationRole = "agent" | "judge";

export interface AppConfig {
  key: AppKey;
  displayName: string;
  domain: string;
  matchPatterns: string[];
  newChatUrl: string;
  automationRoles: AutomationRole[];
  loginUrlPatterns: string[];
  enabled: boolean;
}

export interface AppConfigFile {
  apps: AppConfig[];
}

export interface SupportedAppWithRoles extends SupportedApp {
  automationRoles: AutomationRole[];
  loginUrlPatterns: string[];
}

import appsConfig from "@/config/apps.json" with { type: "json" };

function loadAppsConfig(): AppConfig[] {
  const config = appsConfig as unknown as AppConfigFile;
  if (!config.apps || !Array.isArray(config.apps)) {
    throw new Error("Invalid apps config: missing 'apps' array");
  }
  return config.apps.filter((app) => app.enabled !== false);
}

function validateAppConfig(app: AppConfig, index: number): void {
  const required: (keyof AppConfig)[] = ["key", "displayName", "domain", "matchPatterns", "newChatUrl", "automationRoles"];
  for (const field of required) {
    if (!app[field]) {
      throw new Error(`App config entry at index ${index} is missing required field: ${field}`);
    }
  }
  if (!Array.isArray(app.matchPatterns) || app.matchPatterns.length === 0) {
    throw new Error(`App config entry '${app.key}' has no matchPatterns`);
  }
  if (!Array.isArray(app.automationRoles)) {
    throw new Error(`App config entry '${app.key}' has invalid automationRoles`);
  }
}

const VALID_APPS = loadAppsConfig();
VALID_APPS.forEach(validateAppConfig);

export const SUPPORTED_APPS: SupportedAppWithRoles[] = VALID_APPS.map((app) => ({
  key: app.key,
  displayName: app.displayName,
  domain: app.domain,
  matchPatterns: app.matchPatterns,
  newChatUrl: app.newChatUrl,
  automationRoles: app.automationRoles,
  loginUrlPatterns: app.loginUrlPatterns ?? []
}));

export const DEFAULT_AGENT_KEYS: AppKey[] = SUPPORTED_APPS.filter((app) =>
  app.automationRoles.includes("agent")
).map((app) => app.key);

export const DEFAULT_JUDGE_KEY: AppKey = SUPPORTED_APPS.find((app) =>
  app.automationRoles.includes("judge")
)?.key ?? "chatgpt";

export function getSupportedApp(key: AppKey): SupportedAppWithRoles {
  const app = SUPPORTED_APPS.find((candidate) => candidate.key === key);
  if (!app) {
    throw new Error(`Unknown app key: ${key}`);
  }
  return app;
}

export function isAppKey(value: string): value is AppKey {
  return SUPPORTED_APPS.some((app) => app.key === value);
}

export function normalizeAppKeys(keys: string[]): AppKey[] {
  const unique = new Set<AppKey>();
  keys.forEach((key) => {
    if (isAppKey(key)) {
      unique.add(key);
    }
  });
  return [...unique];
}

export function isAutomationSupported(appKey: AppKey, role: AutomationRole): boolean {
  const app = SUPPORTED_APPS.find((candidate) => candidate.key === appKey);
  return Boolean(app && app.automationRoles.includes(role));
}

export function getAppsForRole(role: AutomationRole): SupportedAppWithRoles[] {
  return SUPPORTED_APPS.filter((app) => app.automationRoles.includes(role));
}

export function getAllMatchPatterns(): string[] {
  return SUPPORTED_APPS.flatMap((app) => app.matchPatterns);
}

export function getAllHostPermissions(): string[] {
  return getAllMatchPatterns();
}
