# Changelog

All notable changes to the AWS SPA Hosting Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
