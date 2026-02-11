# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the AWS SPA Hosting Kit, please report it by:

1. Opening an issue on GitHub: https://github.com/rusty428/aws-spa-hosting-kit/issues
2. Or emailing the maintainer directly: rustynations@gmail.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Supported Versions

Only the latest release is actively supported with security updates.

## Security Best Practices

This kit follows AWS security best practices:
- Private S3 buckets with no public access
- Origin Access Control (OAC) for CloudFront
- Least privilege IAM policies
- Encrypted S3 buckets
- HTTPS-only CloudFront distributions

For production deployments, review the IAM permissions summary in the README and adjust as needed for your security requirements.
