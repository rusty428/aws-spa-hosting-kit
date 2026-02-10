/**
 * Configuration types for AWS SPA Hosting Kit
 */

export interface HostingConfig {
  projectName: string;
  github: GitHubConfig;
  aws: AwsConfig;
  domain?: DomainConfig;
  notifications?: NotificationConfig;
  build?: BuildConfig;
}

export interface GitHubConfig {
  repositoryUrl: string;
  branch?: string;
}

export interface AwsConfig {
  region: string;
  accountId?: string;
}

export interface DomainConfig {
  customDomain?: string;
  certificateArn?: string;
}

export interface NotificationConfig {
  email?: string;
}

export interface BuildConfig {
  outputDirectory?: string;
  buildCommand?: string;
  installCommand?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
