# Prerequisites – AWS SPA Hosting Kit

You must have **all** of the following before deploying this kit.

## Local Environment

- **Node.js** 18 or newer (for local development)
- **npm** (comes with Node.js)
- **Git** for version control

**Note**: The AWS CodeBuild pipeline uses Node.js 20. Your local environment can use Node.js 18+ for development and testing.

## AWS

- **AWS Account** with appropriate permissions
- **AWS CLI v2** installed and configured
- **AWS Credentials** configured (`aws configure`)
- **IAM Permissions** to create:
  - S3 buckets
  - CloudFront distributions
  - IAM roles and policies
  - CodePipeline, CodeBuild, CodeConnections
  - SNS topics
  - Lambda functions
  - EventBridge rules

## Source Repository

- **A source repository** containing a SPA that builds to static files
- **Supported providers**:
  - GitHub
  - Bitbucket
  - GitLab
  - GitHub Enterprise Server
  - GitLab self-managed
  - Azure DevOps
- **Post-deployment**: Ability to authorize OAuth connection via AWS Console
  - Requires AWS Console access (not just CLI)
  - Requires account access to your source code provider for OAuth flow
  - One-time setup per project

## SPA Requirements

Your Single Page Application must:
- Build to a static output directory (e.g., `dist/`, `build/`)
- Use standard Node.js build tooling (`npm`, `yarn`, etc.)
- Produce HTML, CSS, and JavaScript files
- Not require server-side rendering (SSR is out of scope)

## Optional (If Used)

- **ACM Certificate** in `us-east-1` region (required for custom domains with CloudFront)
- **Route 53 Hosted Zone** (for DNS management with custom domains)
- **Email Address** (for SNS deployment notifications)

## Verification Checklist

Before proceeding, verify you can run these commands successfully:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm is available
npm --version

# Check AWS CLI is installed and configured
aws --version
aws sts get-caller-identity

# Check Git is available
git --version
```

**Note**: You do NOT need a global CDK CLI installation. The project includes CDK as a dependency and uses `npx cdk` to run the correct version.

If all commands succeed (except CDK, which is optional), you're ready to proceed with the [Quick Start](README.md#quick-start).

---

Last updated: 2026-02-10
