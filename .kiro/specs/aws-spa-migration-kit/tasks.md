# Implementation Plan: AWS SPA Migration Kit

## Overview

This implementation plan breaks down the AWS SPA Migration Kit into discrete coding tasks. The kit will be built using AWS CDK with TypeScript, providing infrastructure-as-code for deploying SPAs to AWS with automated CI/CD pipelines.

The implementation follows a bottom-up approach: configuration and validation first, then core CDK infrastructure, followed by pipeline configuration, notifications, CLI tooling, and finally documentation and scaffolding for advanced features.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - Initialize AWS CDK TypeScript project
  - Configure package.json with required dependencies: @aws-cdk/core, @aws-cdk/aws-s3, @aws-cdk/aws-cloudfront, @aws-cdk/aws-codepipeline, @aws-cdk/aws-codebuild, @aws-cdk/aws-codeconnections, @aws-cdk/aws-sns
  - Set up TypeScript configuration (tsconfig.json)
  - Create .gitignore file that excludes temp/, node_modules/, cdk.out/, *.js, *.d.ts
  - Create basic directory structure: src/, test/, config/
  - _Requirements: 6.4, 6.5_

- [ ] 2. Implement configuration module
  - [ ] 2.1 Create configuration interfaces and types
    - Define MigrationConfig interface with all required and optional fields
    - Define ValidationResult interface
    - Create types for GitHub, AWS, domain, notifications, and build configuration
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.2 Implement configuration file loader
    - Create ConfigLoader class with static load() method
    - Parse YAML configuration file using js-yaml library
    - Handle file not found errors
    - Handle YAML parsing errors
    - _Requirements: 1.7_

  - [ ] 2.3 Implement configuration validation
    - Create ConfigLoader.validate() method
    - Validate GitHub repository URL format (must match https://github.com/{owner}/{repo})
    - Validate AWS region against known region list
    - Validate email format if provided
    - Validate that customDomain requires certificateArn
    - Return ValidationResult with descriptive error messages
    - _Requirements: 1.7, 10.1, 10.2, 10.3, 10.6_

  - [ ] 2.4 Implement default value assignment
    - Set default branch to "main" if not specified
    - Set default build.outputDirectory to "dist" if not specified
    - Set default build.buildCommand to "npm run build" if not specified
    - Set default build.installCommand to "npm ci" if not specified
    - Set default notification email to maintainer email if not specified
    - _Requirements: 1.5_

  - [ ]* 2.5 Write property test for configuration validation
    - **Property 1: Configuration Validation Accepts Valid Configs**
    - **Property 2: Configuration Validation Rejects Invalid Configs with Descriptive Errors**
    - **Property 3: Optional Configuration Fields Are Handled Correctly**
    - Generate random valid and invalid configurations
    - Test validation accepts all valid configs
    - Test validation rejects invalid configs with descriptive errors
    - Test optional fields are handled correctly with defaults
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 10.1, 10.2, 10.3, 10.6_

- [ ] 3. Implement BuildSpec generation module
  - [ ] 3.1 Create BuildSpec interfaces and types
    - Define BuildSpec interface matching CodeBuild buildspec.yml schema
    - Define phases, artifacts, and environment configuration types
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 3.2 Implement buildspec generator
    - Create PipelineConfigGenerator.generateBuildSpec() method
    - Generate install phase with install command from config
    - Generate build phase with build command from config
    - Generate artifacts section with output directory from config
    - Set Node.js runtime version (use latest LTS)
    - _Requirements: 4.1, 4.2, 4.3, 9.5, 9.6_

  - [ ]* 3.3 Write property test for buildspec generation
    - **Property 4: BuildSpec Generation Contains Required Commands**
    - Generate random valid configurations with various build settings
    - Assert generated buildspec contains install command
    - Assert generated buildspec contains build command
    - Assert generated buildspec has correct output directory
    - _Requirements: 4.1, 4.2, 4.3, 9.5, 9.6_

- [ ] 4. Implement core CDK stack infrastructure
  - [ ] 4.1 Create main CDK stack class
    - Create SpaMigrationStack extending cdk.Stack
    - Accept MigrationConfig in constructor
    - Store config as private property
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 4.2 Implement S3 bucket creation
    - Create createS3Bucket() private method
    - Configure bucket for static website hosting
    - Enable public read access with bucket policy
    - Set removal policy to DESTROY for easy cleanup
    - Add bucket name to stack outputs
    - _Requirements: 2.1_

  - [ ] 4.3 Implement CloudFront distribution creation
    - Create createCloudFrontDistribution() private method
    - Configure S3 bucket as origin
    - Set default root object to "index.html"
    - Configure error responses (404 -> index.html for SPA routing)
    - Enable compression
    - Add distribution URL to stack outputs
    - _Requirements: 2.2, 2.7_

  - [ ] 4.4 Implement CodeStar Connection creation
    - Create createCodeStarConnection() private method
    - Create CfnConnection resource for GitHub
    - Extract owner and repo from GitHub URL in config
    - Add connection ARN to stack outputs
    - Add note in output about required authorization
    - _Requirements: 2.4, 6.3_

  - [ ] 4.5 Implement CodeBuild project creation
    - Create createCodeBuildProject() private method
    - Configure Node.js environment (latest LTS)
    - Use generated buildspec from PipelineConfigGenerator
    - Configure artifacts to output to S3
    - Create IAM role with necessary permissions
    - _Requirements: 2.5, 4.1, 4.2, 4.3_

  - [ ]* 4.6 Write unit tests for CDK stack construction
    - Test stack synthesizes without errors
    - Test S3 bucket has correct configuration
    - Test CloudFront distribution has S3 origin
    - Test CodeStar connection uses correct GitHub URL
    - Test CodeBuild project has correct environment
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Checkpoint - Ensure core infrastructure tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement CodePipeline orchestration
  - [ ] 6.1 Create pipeline stage configuration methods
    - Implement createSourceStage() method using CodeStar connection
    - Implement createBuildStage() method using CodeBuild project
    - Implement createDeployStage() method for S3 deployment
    - Configure stage transitions and artifacts
    - _Requirements: 2.3, 4.4_

  - [ ] 6.2 Implement main pipeline creation
    - Create createPipeline() private method
    - Wire together Source, Build, and Deploy stages
    - Configure artifact bucket
    - Create IAM role with necessary permissions
    - Add pipeline name to stack outputs
    - _Requirements: 2.3, 4.4_

  - [ ] 6.3 Implement CloudFront cache invalidation
    - Create setupCloudFrontInvalidation() private method
    - Add Lambda function to invalidate CloudFront cache after deployment
    - Trigger Lambda from pipeline success event
    - Configure Lambda with CloudFront distribution ID
    - _Requirements: 4.5_

  - [ ]* 6.4 Write property test for pipeline configuration
    - **Property 7: Pipeline Configuration Uses Config File Repository URL**
    - **Property 9: CloudFront Invalidation After Deployment**
    - Generate random valid configurations
    - Assert pipeline source stage uses GitHub URL from config
    - Assert pipeline includes CloudFront invalidation
    - _Requirements: 4.5, 6.3_

- [ ] 7. Implement notification system
  - [ ] 7.1 Create notification module
    - Create NotificationManager class
    - Implement constructor accepting SNS topic and email
    - Create createSubscription() method for email subscription
    - _Requirements: 2.6, 5.1, 5.2, 5.3, 5.4_

  - [ ] 7.2 Implement SNS topic creation in stack
    - Create createNotificationTopic() private method
    - Only create topic if notification email is configured
    - Create email subscription if topic is created
    - Add topic ARN to stack outputs
    - _Requirements: 2.6_

  - [ ] 7.3 Wire notifications to pipeline events
    - Implement attachToPipeline() method
    - Create EventBridge rule for pipeline success
    - Create EventBridge rule for pipeline failure
    - Target SNS topic with formatted messages
    - _Requirements: 5.2, 5.3_

  - [ ] 7.4 Wire notifications to CloudFront invalidation
    - Implement attachToDistribution() method
    - Send notification when invalidation completes
    - _Requirements: 5.4_

  - [ ] 7.5 Wire notifications to stack deployment
    - Add custom resource to send notification on stack deployment
    - Include CloudFront URL in deployment notification
    - _Requirements: 5.1_

  - [ ]* 7.6 Write property test for notification system
    - **Property 5: Notification System Wiring**
    - **Property 8: Pipeline Failure Triggers Notification**
    - Generate configurations with notification email
    - Assert SNS topic is created
    - Assert email subscription exists
    - Assert pipeline has notification rules
    - Assert failure events trigger notifications
    - _Requirements: 2.6, 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement CLI module
  - [ ] 8.1 Create CLI interface
    - Create MigrationCLI class with static methods
    - Implement deploy() method that loads config and runs cdk deploy
    - Implement destroy() method that runs cdk destroy
    - Implement validate() method that validates config without deploying
    - Implement status() method that shows stack status
    - _Requirements: 2.7_

  - [ ] 8.2 Implement AWS credentials validation
    - Check for AWS credentials before deployment
    - Provide helpful error message if credentials not found
    - Include instructions for running aws configure
    - _Requirements: 10.4_

  - [ ] 8.3 Implement error handling and user feedback
    - Catch and format CDK deployment errors
    - Catch and format AWS API errors
    - Display progress indicators during deployment
    - Display stack outputs after successful deployment
    - _Requirements: 2.7, 10.4_

  - [ ]* 8.4 Write property test for CLI error messages
    - **Property 10: AWS Credentials Validation Provides Helpful Error**
    - Mock AWS credential failures
    - Assert error message contains "aws configure"
    - Assert error message is helpful and actionable
    - _Requirements: 10.4_

  - [ ]* 8.5 Write unit tests for CLI module
    - Test config loading and validation
    - Test error message formatting
    - Test AWS credential detection
    - Test command parsing
    - _Requirements: 2.7, 10.4_

- [ ] 9. Checkpoint - Ensure all core functionality tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create configuration file template and example
  - [ ] 10.1 Create config.example.yml template
    - Include all required fields with placeholder values
    - Include all optional fields commented out with examples
    - Add inline comments explaining each field
    - Include multi-environment scaffolding as commented example
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [ ] 10.2 Create config.yml for sample SPA
    - Point to https://github.com/rusty428/aws-migration-sample-spa
    - Use us-east-1 region
    - Include notification email (can be changed by user)
    - Set output directory to "dist"
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Add advanced features scaffolding
  - [ ] 11.1 Create commented API Gateway integration example
    - Add commented createApiGateway() method to AdvancedFeatures class
    - Include example configuration in config template
    - Add brief explanation of use case
    - _Requirements: 7.1_

  - [ ] 11.2 Create commented Route 53 DNS example
    - Add commented createHostedZone() and createAliasRecord() methods
    - Include example configuration in config template
    - Add brief explanation of custom domain setup
    - _Requirements: 7.2_

  - [ ] 11.3 Create commented ACM certificate example
    - Add commented createCertificate() method
    - Include example configuration in config template
    - Add note about us-east-1 requirement for CloudFront certificates
    - _Requirements: 7.3_

  - [ ] 11.4 Create commented multi-environment example
    - Add commented loadEnvironmentConfig() method
    - Include example multi-environment configuration in config template
    - Add brief explanation of environment-specific deployments
    - _Requirements: 7.4_

  - [ ] 11.5 Mark all scaffolding as non-functional
    - Add clear comments indicating code is scaffolding only
    - Add TODO comments for implementation
    - Include links to AWS documentation for each feature
    - _Requirements: 7.5, 7.6_

- [ ] 12. Create comprehensive documentation
  - [ ] 12.1 Write README with quick start guide
    - Add project overview and key features
    - List prerequisites: Node.js, AWS CLI, AWS account, GitHub account
    - Provide step-by-step deployment instructions
    - Include expected timeline (5-10 minutes for redeployments)
    - Add troubleshooting section for common errors
    - _Requirements: 8.1, 8.2, 8.3, 8.8_

  - [ ] 12.2 Document CodeStar Connection authorization
    - Explain one-time OAuth authorization process
    - Provide AWS Console URL for authorization
    - Include screenshots or detailed steps
    - Explain what permissions are granted
    - _Requirements: 8.5_

  - [ ] 12.3 Add architecture diagrams
    - Create high-level architecture diagram showing all AWS services
    - Create deployment flow diagram
    - Create CI/CD pipeline diagram
    - Use Mermaid format for diagrams in README
    - _Requirements: 8.4_

  - [ ] 12.4 Document AWS region requirements
    - List which features require us-east-1 (ACM certificates for CloudFront)
    - Explain regional service availability
    - Provide guidance on region selection
    - _Requirements: 8.7_

  - [ ] 12.5 Create "What's Next" section
    - Describe advanced features available as scaffolding
    - Explain how to enable commented features
    - Provide links to AWS documentation for advanced topics
    - Include contact information for custom configurations
    - _Requirements: 8.6_

  - [ ] 12.6 Create CONTRIBUTING.md
    - Explain project structure
    - Provide guidelines for adding new features
    - Explain testing requirements
    - Include code style guidelines

  - [ ] 12.7 Create LICENSE file
    - Choose appropriate open source license
    - Add license text

- [ ] 13. Integration testing with sample SPA
  - [ ]* 13.1 Write integration test for sample SPA deployment
    - Create test that deploys sample SPA to test AWS account
    - Verify all AWS resources are created correctly
    - Verify CloudFront URL is accessible
    - Verify SPA loads correctly
    - Clean up resources after test
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 13.2 Write integration test for automatic redeployment
    - Deploy sample SPA
    - Make change to sample SPA repository
    - Verify pipeline triggers automatically
    - Verify updated content is deployed
    - Clean up resources after test
    - _Requirements: 4.4, 4.5_

- [ ] 14. Final polish and validation
  - [ ] 14.1 Add package.json scripts
    - Add "build" script for TypeScript compilation
    - Add "test" script for running all tests
    - Add "test:unit" script for unit tests only
    - Add "test:property" script for property tests only
    - Add "deploy" script that validates config and runs cdk deploy
    - Add "destroy" script that runs cdk destroy

  - [ ] 14.2 Validate all property tests run with 100+ iterations
    - Configure fast-check to run minimum 100 iterations per property
    - Verify all property tests pass
    - _Requirements: All property-based test requirements_

  - [ ] 14.3 Run full test suite
    - Run all unit tests
    - Run all property tests
    - Verify code coverage meets minimum threshold (80%)
    - Fix any failing tests

  - [ ] 14.4 Manual testing checklist
    - Clone repository fresh
    - Follow README instructions exactly
    - Deploy to test AWS account
    - Authorize CodeStar Connection
    - Push change to sample SPA
    - Verify automatic redeployment
    - Verify notification emails received
    - Run cdk destroy and verify cleanup

- [ ] 15. Final checkpoint - Ready for release
  - Ensure all tests pass, documentation is complete, and manual testing is successful. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests verify end-to-end functionality with actual AWS resources
- The implementation uses TypeScript with AWS CDK
- Testing uses fast-check for property-based testing
- All property tests must run minimum 100 iterations
