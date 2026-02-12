# Changelog

All notable changes to the AWS SPA Hosting Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-12

### Added
- Resource tagging support for cost allocation and organization
- Optional `tags` configuration field for custom resource tags
- Default tags automatically applied: `ProjectName` and `ManagedBy: aws-spa-hosting-kit`
- Tag validation for AWS constraints (key/value length and character restrictions)
- Tags applied to all taggable resources: S3, CloudFront, CodeBuild, CodePipeline, Lambda, SNS, EventBridge, IAM, CloudWatch Logs

## [1.1.0] - 2026-02-11

### Added
- MIT License file
- Comprehensive cleanup/teardown documentation in CLI output, README, and DEVELOPER.md
- Post-deployment instructions with formatted next steps in CLI output
- Automatic pipeline trigger after stack deployment (only if connection is authorized)
- Direct URL output to AWS Console connections page
- Stack name derived from projectName for multi-stack deployments
- Email subscription confirmation reminder and spam folder warning

### Changed
- Improved user experience with clear step-by-step guidance
- Enhanced troubleshooting documentation for common issues

### Fixed
- Stack name collision when deploying multiple instances
- Documentation consistency for CDK commands (now uses `npx cdk`)
- Set 43 recommended CDK feature flags to eliminate synthesis warnings

## [1.0.3] - 2026-02-11

### Added
- Clear post-deployment instructions in CLI output with formatted next steps
- Ready-to-copy AWS CLI command for triggering pipeline after connection authorization

### Changed
- Improved user experience with step-by-step guidance after stack deployment

## [1.0.2] - 2026-02-11

### Added
- Automatic pipeline trigger after stack deployment (only if connection is authorized)
- Direct URL output to AWS Console connections page for easy authorization
- Stack name now derived from projectName for multi-stack deployments

### Fixed
- Stack name collision when deploying multiple instances (now uses `{projectName}-HostingStack`)

## [1.0.1] - 2026-02-11

### Fixed
- Updated all documentation to use `npx cdk` commands for consistency with package.json scripts
- Set 43 recommended CDK feature flags in cdk.json to eliminate synthesis warnings
- Clarified that CDK deployment completes successfully with connection in PENDING state

### Changed
- Documentation now consistently uses `npx cdk synth` instead of `npm run cdk synth`

## [1.0.0] - 2026-02-10

### Added
- S3 + CloudFront hosting with Origin Access Control (OAC)
- Git-backed CI/CD via CodePipeline, CodeBuild, and CodeConnections
- Support for multiple source code providers (GitHub, Bitbucket, GitLab, GitHub Enterprise Server, GitLab self-managed, Azure DevOps)
- Configuration-driven deployment via YAML config file
- Project name-based resource namespacing for multi-SPA deployments in same account
- Optional email notifications via SNS for deployment events
- Automatic CloudFront cache invalidation on successful deployments
- AI-assisted setup prompt for guided configuration
- Comprehensive documentation (README, DEVELOPER, PREREQUISITES, IDEPrompt)
- TypeScript-based AWS CDK infrastructure
- Property-based testing support with fast-check

### Security
- Private S3 buckets with all public access blocked
- CloudFront Origin Access Control (OAC) for secure S3 access
- S3 server-side encryption enabled by default
- HTTPS enforcement via CloudFront
- Least-privilege IAM roles for service execution

[1.0.0]: https://github.com/rusty428/aws-spa-hosting-kit/releases/tag/v1.0.0
