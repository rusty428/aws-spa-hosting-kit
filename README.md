# AWS SPA Hosting Kit

Infrastructure-as-code solution for hosting Single Page Applications on AWS with automated CI/CD pipelines.

## Overview

The AWS SPA Hosting Kit provides a complete infrastructure setup for hosting your SPA on AWS with:

- **S3 + CloudFront**: Static hosting with global CDN delivery
- **Automated CI/CD**: CodePipeline triggered by GitHub commits
- **Zero SPA Changes**: Your existing SPA repository remains untouched
- **Email Notifications**: Optional deployment status alerts
- **One Command Deploy**: Simple setup and deployment

This kit can be used both to host a new SPA from scratch and to migrate an existing SPA to AWS. The design intentionally keeps infrastructure and application code separate, allowing teams to adopt AWS-native hosting and CI/CD without modifying their existing repositories or workflows.

This kit is designed for teams that want AWS-native hosting and CI/CD without adopting a new frontend framework, service control plane, or modifying their existing SPA repository.

## Architecture

```
GitHub Repo → CodeStar Connection → CodePipeline → CodeBuild → S3 → CloudFront (OAC)
                                          ↓
                                    SNS Notifications
```

**Security:** S3 bucket is private with CloudFront Origin Access Control (OAC) for secure access.

**SPA Routing:** CloudFront error response mapping (404/403 → index.html) ensures client-side routing works correctly.

## Prerequisites

- **Node.js** 18+ and npm
- **AWS CLI** configured with credentials (`aws configure`)
- **AWS Account** with appropriate permissions
- **GitHub Repository** containing your SPA

## Quick Start

### 1. Clone this repository

```bash
git clone https://github.com/rusty428/aws-spa-hosting-kit.git
cd aws-spa-hosting-kit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your SPA

Copy the example configuration and edit it:

```bash
cp config/config.example.yml config/config.yml
```

Edit `config/config.yml` with your settings:

```yaml
github:
  repositoryUrl: "https://github.com/your-username/your-spa-repo"
  branch: "main"

aws:
  region: "us-east-1"

notifications:
  email: "your-email@example.com"
```

### 4. Deploy the infrastructure

```bash
npm run deploy
```

This will:
- Create private S3 bucket for static assets
- Create CloudFront distribution
- Set up CodePipeline with GitHub integration
- Configure email notifications (if enabled)

**Expected time**: 5-10 minutes for initial deployment

### 5. Authorize GitHub Connection

After deployment, you'll see output with a CodeStar Connection ARN. You need to authorize this connection:

1. Go to [AWS CodePipeline Console](https://console.aws.amazon.com/codesuite/settings/connections)
2. Find the "spa-hosting-github" connection
3. Click "Update pending connection"
4. Complete the GitHub OAuth authorization

### 6. Done!

Your infrastructure is ready! Any push to the configured branch will automatically trigger a redeployment.

The CloudFront URL will be in the deployment output:
```
Outputs:
SpaHostingStack.CloudFrontUrl = https://d1234567890.cloudfront.net
```

## Configuration Options

### Required Fields

```yaml
github:
  repositoryUrl: "https://github.com/owner/repo"  # Your SPA repository
  
aws:
  region: "us-east-1"  # AWS region for deployment
```

### Optional Fields

```yaml
github:
  branch: "main"  # Branch to monitor (default: "main")

notifications:
  email: "you@example.com"  # Deployment notifications

build:
  outputDirectory: "dist"  # Build output folder (default: "dist")
  buildCommand: "npm run build"  # Build command (default: "npm run build")
  installCommand: "npm ci"  # Install command (default: "npm ci")
```

## Supported SPA Frameworks

This kit works with any SPA framework that builds to static files:

- ✅ React (Create React App, Vite, Next.js static export)
- ✅ Vue (Vue CLI, Vite)
- ✅ Angular
- ✅ Svelte
- ✅ Any framework that outputs HTML/CSS/JS

**Constraint:** Frameworks must produce a fully static output directory (e.g., `dist/`, `build/`). Server-side rendering is out of scope.

## Non-Goals

This kit does not:

- Modify your SPA repository or Git workflows
- Manage backend services, authentication, or APIs
- Replace your existing CI for non-frontend workloads
- Provide preview environments or PR-based deployments (yet)

Many teams start with this kit as a lift-and-shift hosting migration, then progressively enable custom domains, WAF, logging, or multi-environment deployments as their AWS footprint grows. It's equally suitable for greenfield SPAs that need production-grade AWS hosting from day one.

## Notifications

When notifications are enabled, you'll receive emails for:

- ✅ Stack deployment complete
- ✅ Pipeline execution succeeded
- ❌ Pipeline execution failed
- 🔄 CloudFront cache invalidated

## Commands

```bash
# Build TypeScript
npm run build

# Deploy infrastructure
npm run deploy

# Destroy infrastructure
npm run destroy

# Synthesize CloudFormation template
npm run cdk synth

# View differences
npm run cdk diff
```

## Troubleshooting

### Configuration validation failed

Make sure your `config.yml` has:
- Valid GitHub repository URL (format: `https://github.com/owner/repo`)
- Valid AWS region
- Valid email format (if notifications enabled)

### Pipeline not triggering

1. Check that CodeStar Connection is authorized in AWS Console
2. Verify the branch name matches your configuration
3. Check CodePipeline execution history in AWS Console

### Build failures

Check CodeBuild logs in AWS Console:
1. Go to CodePipeline
2. Click on your pipeline execution
3. Click "Details" on the Build stage
4. View logs for error messages

Common issues:
- Incorrect build command
- Wrong output directory
- Missing dependencies in package.json

## AWS Region Notes

- Most features work in any AWS region
- **ACM certificates for CloudFront** require `us-east-1`
- If using custom domains, consider deploying to `us-east-1`

## Advanced Features (Commented Scaffolding)

The kit includes commented examples for:

- API Gateway integration
- Route 53 DNS configuration
- ACM certificate management
- Multi-environment setups (dev/staging/prod)

See `config/config.example.yml` for details.

## Cost Estimate

Typical monthly costs for a small SPA:

- **S3**: $0.023/GB storage + $0.09/GB transfer
- **CloudFront**: $0.085/GB (first 10TB)
- **CodePipeline**: $1/active pipeline
- **CodeBuild**: $0.005/build minute

**Estimated**: $5-20/month for most SPAs

## Sample SPA

This kit is tested with: https://github.com/rusty428/aws-migration-sample-spa

A React + Vite + TypeScript SPA that demonstrates the complete workflow. This sample can be used as a starting point for new SPAs or as a reference for hosting an existing SPA.

## Why This Exists

**Why not Amplify?**
Amplify is a full-stack framework with its own CLI, conventions, and abstractions. This kit is for teams that want direct control over AWS primitives without framework lock-in.

**Why not Netlify/Vercel?**
Those are excellent platforms, but some teams need AWS-native infrastructure for compliance, existing AWS investments, or integration with other AWS services. This kit provides that without vendor lock-in.

**Why CDK + primitives?**
CDK gives you the full power of CloudFormation with type safety and composability. You can extend this kit with any AWS service, customize IAM policies, or integrate with existing infrastructure—all in TypeScript.

This kit is infrastructure, not a framework. You own the code, you control the deployment, and you can evolve it as your needs grow.

## License

MIT

## Support

For questions or custom configurations, contact @awsrusty
