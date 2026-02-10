#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SpaHostingStack } from '../stack/spa-migration-stack';
import { ConfigLoader } from '../config';

const app = new cdk.App();

// Load configuration
const configPath = app.node.tryGetContext('config') || 'config/config.yml';

try {
  const config = ConfigLoader.load(configPath);
  
  // Validate configuration
  const validation = ConfigLoader.validate(config);
  if (!validation.valid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  // Display warnings if any
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Create stack
  new SpaHostingStack(app, 'SpaHostingStack', config, {
    env: {
      region: config.aws.region,
      account: config.aws.accountId || process.env.CDK_DEFAULT_ACCOUNT,
    },
    description: 'AWS SPA Hosting Kit - Infrastructure for hosting SPAs with automated CI/CD',
  });
  
} catch (error) {
  console.error('❌ Error loading configuration:', (error as Error).message);
  process.exit(1);
}

app.synth();
