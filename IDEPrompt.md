# IDE Prompt – AWS SPA Hosting Kit Setup

**Note**: This prompt is versioned alongside the kit. If setup behavior changes, update this file.

Copy and paste this prompt into your AI-powered IDE (Cursor, GitHub Copilot, Kiro, etc.) to guide the setup process from an empty directory.

---

## Prompt Template

Copy everything below this line:

```
I want to set up the AWS SPA Hosting Kit to host my Single Page Application on AWS with automated CI/CD.

My Project Details:
- Project Name: [YOUR-PROJECT-NAME] (alphanumeric, hyphens, underscores only)
- SPA Repository URL: [YOUR-GITHUB-URL] (e.g., https://github.com/username/repo)
- Branch to monitor: [BRANCH-NAME] (default: main)
- AWS Region: [AWS-REGION] (e.g., us-east-1)
- Notification Email: [YOUR-EMAIL] (optional)
- Build Output Directory: [OUTPUT-DIR] (default: dist)

Please help me:

1. Clone the AWS SPA Hosting Kit repository from https://github.com/rusty428/aws-spa-hosting-kit.git

2. Install dependencies with npm install

3. Create and configure config/config.yml with my project details above

4. Validate my configuration is correct

5. Build the TypeScript code with npm run build

6. Show me the CDK deployment command I should run: npm run deploy

7. After deployment, remind me to:
   - Authorize the GitHub connection in AWS Console (Developer Tools → Settings → Connections)
   - Confirm the SNS email subscription (if notifications enabled)
   - Test the pipeline by pushing to my repository

8. If any step fails, explain why it failed and which document to consult next (README.md, PREREQUISITES.md, or DEVELOPER.md).

Prerequisites I've already completed:
- Node.js 18+ installed
- AWS CLI configured (aws configure)
- AWS account with appropriate permissions
- Source repository with SPA that builds to static files

Reference Documentation:
- Prerequisites: See PREREQUISITES.md
- User Guide: See README.md
- Developer Guide: See DEVELOPER.md
```

---

## Example with Filled Values

Copy everything below this line:

```
I want to set up the AWS SPA Hosting Kit to host my Single Page Application on AWS with automated CI/CD.

My Project Details:
- Project Name: my-company-website
- SPA Repository URL: https://github.com/mycompany/website
- Branch to monitor: main
- AWS Region: us-east-1
- Notification Email: devops@mycompany.com
- Build Output Directory: dist

Please help me:

1. Clone the AWS SPA Hosting Kit repository from https://github.com/rusty428/aws-spa-hosting-kit.git

2. Install dependencies with npm install

3. Create and configure config/config.yml with my project details above

4. Validate my configuration is correct

5. Build the TypeScript code with npm run build

6. Show me the CDK deployment command I should run: npm run deploy

7. After deployment, remind me to:
   - Authorize the GitHub connection in AWS Console (Developer Tools → Settings → Connections)
   - Confirm the SNS email subscription (if notifications enabled)
   - Test the pipeline by pushing to my repository

8. If any step fails, explain why it failed and which document to consult next (README.md, PREREQUISITES.md, or DEVELOPER.md).

Prerequisites I've already completed:
- Node.js 18+ installed
- AWS CLI configured (aws configure)
- AWS account with appropriate permissions
- Source repository with SPA that builds to static files

Reference Documentation:
- Prerequisites: See PREREQUISITES.md
- User Guide: See README.md
- Developer Guide: See DEVELOPER.md
```

---

## Tips for Using This Prompt

1. **Fill in your details** in the bracketed placeholders before pasting
2. **Verify prerequisites** are met before starting (see PREREQUISITES.md)
3. **Have AWS credentials ready** - the AI will need you to run `aws configure` if not already done
4. **Review the generated config** before deploying to ensure accuracy
5. **Follow post-deployment steps** carefully, especially the GitHub connection authorization

## What the AI Will Do

The AI assistant will:
- Guide you through cloning and setup
- Create a properly formatted `config/config.yml` file
- Validate your configuration against the schema
- Help you build and deploy the infrastructure
- Provide clear next steps for authorization and testing

## What You Need to Do Manually

Some steps require manual action in the AWS Console:
- Authorize the GitHub connection (OAuth flow)
- Confirm SNS email subscription (click link in email)
- Verify deployment in AWS Console

## Troubleshooting

If the AI encounters issues:
- Check that all prerequisites are met (PREREQUISITES.md)
- Verify AWS credentials: `aws sts get-caller-identity`
- Review configuration validation errors
- Consult README.md troubleshooting section

---

Last updated: 2026-02-10
