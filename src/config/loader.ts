import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { HostingConfig, ValidationResult } from './types';

/**
 * ConfigLoader handles loading and validating configuration files
 */
export class ConfigLoader {
  /**
   * Load configuration from a YAML file
   * @param filePath Path to the configuration file
   * @returns Parsed configuration object with defaults applied
   * @throws Error if file not found or YAML parsing fails
   */
  static load(filePath: string): HostingConfig {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Configuration file not found: ${filePath}`);
      }

      // Read file contents
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // Parse YAML
      const config = yaml.load(fileContents) as HostingConfig;

      if (!config) {
        throw new Error(`Configuration file is empty: ${filePath}`);
      }

      // Apply defaults
      return this.applyDefaults(config);
    } catch (error) {
      if (error instanceof yaml.YAMLException) {
        throw new Error(`YAML parsing error in ${filePath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Apply default values to configuration
   * @param config Configuration object
   * @returns Configuration with defaults applied
   */
  private static applyDefaults(config: HostingConfig): HostingConfig {
    // Default maintainer email for notifications
    const DEFAULT_NOTIFICATION_EMAIL = 'rusty@example.com';

    return {
      ...config,
      github: {
        ...config.github,
        branch: config.github?.branch || 'main'
      },
      notifications: {
        email: config.notifications?.email || DEFAULT_NOTIFICATION_EMAIL
      },
      build: {
        outputDirectory: config.build?.outputDirectory || 'dist',
        buildCommand: config.build?.buildCommand || 'npm run build',
        installCommand: config.build?.installCommand || 'npm ci'
      }
    };
  }

  /**
   * Validate configuration object
   * @param config Configuration to validate
   * @returns ValidationResult with errors and warnings
   */
  static validate(config: HostingConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.projectName) {
      errors.push('Missing required field: projectName');
    } else {
      // Validate project name format (alphanumeric, hyphens, underscores only)
      const projectNamePattern = /^[a-zA-Z0-9-_]+$/;
      if (!projectNamePattern.test(config.projectName)) {
        errors.push(
          'Invalid projectName format. Use only alphanumeric characters, hyphens, and underscores.'
        );
      }
    }

    if (!config.github) {
      errors.push('Missing required field: github');
    } else {
      if (!config.github.repositoryUrl) {
        errors.push('Missing required field: github.repositoryUrl');
      } else {
        // Validate GitHub URL format
        const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
        if (!githubUrlPattern.test(config.github.repositoryUrl)) {
          errors.push(
            'Invalid GitHub repository URL. Expected format: https://github.com/owner/repo'
          );
        }
      }
    }

    if (!config.aws) {
      errors.push('Missing required field: aws');
    } else {
      if (!config.aws.region) {
        errors.push('Missing required field: aws.region');
      } else {
        // Validate AWS region
        const validRegions = [
          'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
          'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-south-2',
          'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
          'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ap-southeast-4',
          'ca-central-1', 'eu-central-1', 'eu-central-2',
          'eu-west-1', 'eu-west-2', 'eu-west-3',
          'eu-south-1', 'eu-south-2', 'eu-north-1',
          'il-central-1', 'me-south-1', 'me-central-1',
          'sa-east-1'
        ];

        if (!validRegions.includes(config.aws.region)) {
          errors.push(
            `Invalid AWS region '${config.aws.region}'. Must be a valid AWS region that supports CodePipeline, CodeBuild, and CodeStar Connections.`
          );
        }

        // Warn if not us-east-1 and custom domain is configured
        if (config.aws.region !== 'us-east-1' && config.domain?.customDomain) {
          warnings.push(
            'ACM certificates for CloudFront must be created in us-east-1. Consider using us-east-1 region for custom domain setup.'
          );
        }
      }
    }

    // Validate optional fields
    if (config.domain) {
      if (config.domain.customDomain && !config.domain.certificateArn) {
        errors.push(
          'domain.certificateArn is required when domain.customDomain is specified'
        );
      }
    }

    if (config.notifications?.email) {
      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(config.notifications.email)) {
        errors.push(
          `Invalid notification email format: '${config.notifications.email}'`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
