import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as codeconnections from 'aws-cdk-lib/aws-codeconnections';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as events_targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { HostingConfig } from '../config/types';
import { PipelineConfigGenerator } from '../pipeline/buildspec-generator';

/**
 * SpaHostingStack creates AWS infrastructure for SPA hosting and CI/CD
 */
export class SpaHostingStack extends cdk.Stack {
  private readonly config: HostingConfig;
  private bucket!: s3.Bucket;
  private distribution!: cloudfront.Distribution;
  private codeStarConnection!: codeconnections.CfnConnection;
  private buildProject!: codebuild.Project;
  private pipeline!: codepipeline.Pipeline;
  private sourceOutput!: codepipeline.Artifact;
  private buildOutput!: codepipeline.Artifact;
  private notificationTopic?: sns.Topic;

  constructor(scope: Construct, id: string, config: HostingConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    this.config = config;

    // Create S3 bucket for static hosting
    this.bucket = this.createS3Bucket();

    // Create CloudFront distribution
    this.distribution = this.createCloudFrontDistribution(this.bucket);

    // Create CodeStar Connection for GitHub
    this.codeStarConnection = this.createCodeStarConnection();

    // Create CodeBuild project
    this.buildProject = this.createCodeBuildProject();

    // Create artifacts
    this.sourceOutput = new codepipeline.Artifact('SourceOutput');
    this.buildOutput = new codepipeline.Artifact('BuildOutput');

    // Create pipeline
    this.pipeline = this.createPipeline();

    // Create notification topic if email is configured
    this.notificationTopic = this.createNotificationTopic();

    // Wire notifications to pipeline events
    if (this.notificationTopic) {
      this.attachNotificationsToPipeline(this.notificationTopic);
      this.sendStackDeploymentNotification(this.notificationTopic);
    }

    // Setup CloudFront invalidation after deployment
    this.setupCloudFrontInvalidation();
  }

  /**
   * Create S3 bucket for static website hosting
   * Bucket is private - only accessible through CloudFront
   */
  private createS3Bucket(): s3.Bucket {
    const bucket = new s3.Bucket(this, 'SpaBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Output bucket name
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: bucket.bucketName,
      description: 'S3 bucket name for static files (private, accessed via CloudFront)'
    });

    return bucket;
  }

  /**
   * Create CloudFront distribution for CDN delivery
   * Uses Origin Access Control (OAC) - the modern AWS-recommended approach for secure S3 access
   */
  private createCloudFrontDistribution(bucket: s3.Bucket): cloudfront.Distribution {
    // Create Origin Access Control (OAC) - modern replacement for OAI
    const originAccessControl = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: 'spa-hosting-oac',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
        description: 'Origin Access Control for SPA Hosting Kit',
      },
    });

    const distribution = new cloudfront.Distribution(this, 'SpaDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Apply OAC to the CloudFront distribution's S3 origin
    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', originAccessControl.attrId);
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');

    // Grant CloudFront OAC read access to the bucket via bucket policy
    bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        },
      },
    }));

    // Output CloudFront URL
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL'
    });

    return distribution;
  }

  /* 
   * LEGACY OPTION: Origin Access Identity (OAI)
   * 
   * OAI is the older method for securing S3 access from CloudFront.
   * AWS recommends using Origin Access Control (OAC) for new deployments.
   * 
   * To use OAI instead of OAC, replace the createCloudFrontDistribution method above with:
   * 
   * private createCloudFrontDistribution(bucket: s3.Bucket): cloudfront.Distribution {
   *   const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
   *     comment: 'OAI for SPA Hosting Kit',
   *   });
   * 
   *   bucket.grantRead(originAccessIdentity);
   * 
   *   const distribution = new cloudfront.Distribution(this, 'SpaDistribution', {
   *     defaultBehavior: {
   *       origin: origins.S3BucketOrigin.withOriginAccessIdentity(bucket, {
   *         originAccessIdentity,
   *       }),
   *       viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
   *       compress: true,
   *     },
   *     defaultRootObject: 'index.html',
   *     errorResponses: [
   *       {
   *         httpStatus: 404,
   *         responseHttpStatus: 200,
   *         responsePagePath: '/index.html',
   *         ttl: cdk.Duration.minutes(5),
   *       },
   *       {
   *         httpStatus: 403,
   *         responseHttpStatus: 200,
   *         responsePagePath: '/index.html',
   *         ttl: cdk.Duration.minutes(5),
   *       },
   *     ],
   *   });
   * 
   *   new cdk.CfnOutput(this, 'CloudFrontUrl', {
   *     value: `https://${distribution.distributionDomainName}`,
   *     description: 'CloudFront distribution URL'
   *   });
   * 
   *   return distribution;
   * }
   */

  /**
   * Create CodeStar Connection for GitHub integration
   */
  private createCodeStarConnection(): codeconnections.CfnConnection {
    // Extract owner and repo from GitHub URL
    const urlMatch = this.config.github.repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)$/);
    if (!urlMatch) {
      throw new Error('Invalid GitHub repository URL format');
    }

    const connection = new codeconnections.CfnConnection(this, 'GitHubConnection', {
      connectionName: 'spa-hosting-github',
      providerType: 'GitHub',
    });

    // Output connection ARN
    new cdk.CfnOutput(this, 'CodeStarConnectionArn', {
      value: connection.attrConnectionArn,
      description: 'CodeStar Connection ARN (requires authorization in AWS Console)'
    });

    return connection;
  }

  /**
   * Create CodeBuild project for building the SPA
   */
  private createCodeBuildProject(): codebuild.Project {
    // Generate buildspec from configuration
    const buildSpec = PipelineConfigGenerator.generateBuildSpec(this.config);

    const project = new codebuild.Project(this, 'SpaBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, // Includes Node.js 20
        computeType: codebuild.ComputeType.SMALL,
      },
      buildSpec: codebuild.BuildSpec.fromObject(buildSpec),
    });

    // Grant permissions to write to S3 bucket
    this.bucket.grantReadWrite(project);

    return project;
  }

  /**
   * Create source stage for pipeline
   */
  private createSourceStage(): codepipeline.StageProps {
    // Extract owner and repo from GitHub URL
    const urlMatch = this.config.github.repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)$/);
    if (!urlMatch) {
      throw new Error('Invalid GitHub repository URL format');
    }
    const [, owner, repo] = urlMatch;

    const sourceAction = new codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub_Source',
      owner,
      repo,
      branch: this.config.github.branch || 'main',
      output: this.sourceOutput,
      connectionArn: this.codeStarConnection.attrConnectionArn,
    });

    return {
      stageName: 'Source',
      actions: [sourceAction],
    };
  }

  /**
   * Create build stage for pipeline
   */
  private createBuildStage(): codepipeline.StageProps {
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'Build_SPA',
      project: this.buildProject,
      input: this.sourceOutput,
      outputs: [this.buildOutput],
    });

    return {
      stageName: 'Build',
      actions: [buildAction],
    };
  }

  /**
   * Create deploy stage for pipeline
   */
  private createDeployStage(): codepipeline.StageProps {
    const deployAction = new codepipeline_actions.S3DeployAction({
      actionName: 'Deploy_to_S3',
      bucket: this.bucket,
      input: this.buildOutput,
      extract: true,
    });

    return {
      stageName: 'Deploy',
      actions: [deployAction],
    };
  }

  /**
   * Create main pipeline with all stages
   */
  private createPipeline(): codepipeline.Pipeline {
    const pipeline = new codepipeline.Pipeline(this, 'SpaPipeline', {
      pipelineName: 'spa-migration-pipeline',
      restartExecutionOnUpdate: true,
      stages: [
        this.createSourceStage(),
        this.createBuildStage(),
        this.createDeployStage(),
      ],
    });

    // Output pipeline name
    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'CodePipeline name'
    });

    return pipeline;
  }

  /**
   * Setup CloudFront cache invalidation after deployment
   */
  private setupCloudFrontInvalidation(): void {
    // Create Lambda function to invalidate CloudFront cache
    const invalidationFunction = new lambda.Function(this, 'InvalidationFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
        const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
        
        exports.handler = async (event) => {
          const distributionId = process.env.DISTRIBUTION_ID;
          const topicArn = process.env.TOPIC_ARN;
          const cloudfront = new CloudFrontClient({});
          
          try {
            const command = new CreateInvalidationCommand({
              DistributionId: distributionId,
              InvalidationBatch: {
                CallerReference: Date.now().toString(),
                Paths: {
                  Quantity: 1,
                  Items: ['/*']
                }
              }
            });
            
            await cloudfront.send(command);
            console.log('CloudFront invalidation created successfully');
            
            // Send notification if topic ARN is provided
            if (topicArn) {
              const sns = new SNSClient({});
              await sns.send(new PublishCommand({
                TopicArn: topicArn,
                Subject: '🔄 CloudFront Cache Invalidated',
                Message: 'CloudFront cache has been invalidated. Your updated SPA will be available shortly.'
              }));
            }
            
            return { statusCode: 200, body: 'Invalidation created' };
          } catch (error) {
            console.error('Error creating invalidation:', error);
            throw error;
          }
        };
      `),
      environment: {
        DISTRIBUTION_ID: this.distribution.distributionId,
        TOPIC_ARN: this.notificationTopic?.topicArn || '',
      },
    });

    // Grant permissions to create CloudFront invalidations
    invalidationFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cloudfront:CreateInvalidation'],
      resources: [`arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`],
    }));

    // Grant permissions to publish to SNS if topic exists
    if (this.notificationTopic) {
      this.notificationTopic.grantPublish(invalidationFunction);
    }

    // Create EventBridge rule to trigger on pipeline success
    const rule = new events.Rule(this, 'PipelineSuccessRule', {
      eventPattern: {
        source: ['aws.codepipeline'],
        detailType: ['CodePipeline Pipeline Execution State Change'],
        detail: {
          state: ['SUCCEEDED'],
          pipeline: [this.pipeline.pipelineName],
        },
      },
    });

    rule.addTarget(new events_targets.LambdaFunction(invalidationFunction));
  }

  /**
   * Create SNS topic for notifications
   */
  private createNotificationTopic(): sns.Topic | undefined {
    if (!this.config.notifications?.email) {
      return undefined;
    }

    const topic = new sns.Topic(this, 'NotificationTopic', {
      displayName: 'SPA Hosting Notifications',
      topicName: 'spa-hosting-notifications',
    });

    // Create email subscription
    topic.addSubscription(new subscriptions.EmailSubscription(this.config.notifications.email));

    // Output topic ARN
    new cdk.CfnOutput(this, 'NotificationTopicArn', {
      value: topic.topicArn,
      description: 'SNS topic ARN for notifications'
    });

    return topic;
  }

  /**
   * Attach notifications to pipeline events
   */
  private attachNotificationsToPipeline(topic: sns.Topic): void {
    // Pipeline success notification
    const successRule = new events.Rule(this, 'PipelineSuccessNotification', {
      eventPattern: {
        source: ['aws.codepipeline'],
        detailType: ['CodePipeline Pipeline Execution State Change'],
        detail: {
          state: ['SUCCEEDED'],
          pipeline: [this.pipeline.pipelineName],
        },
      },
    });
    successRule.addTarget(new events_targets.SnsTopic(topic, {
      message: events.RuleTargetInput.fromText(
        `✅ SPA Hosting Pipeline Succeeded\n\nPipeline: ${this.pipeline.pipelineName}\nTime: ${events.EventField.time}\n\nYour SPA has been successfully deployed!`
      ),
    }));

    // Pipeline failure notification
    const failureRule = new events.Rule(this, 'PipelineFailureNotification', {
      eventPattern: {
        source: ['aws.codepipeline'],
        detailType: ['CodePipeline Pipeline Execution State Change'],
        detail: {
          state: ['FAILED'],
          pipeline: [this.pipeline.pipelineName],
        },
      },
    });
    failureRule.addTarget(new events_targets.SnsTopic(topic, {
      message: events.RuleTargetInput.fromText(
        `❌ SPA Hosting Pipeline Failed\n\nPipeline: ${this.pipeline.pipelineName}\nTime: ${events.EventField.time}\n\nPlease check the AWS Console for details.`
      ),
    }));
  }

  /**
   * Send notification when stack is deployed
   */
  private sendStackDeploymentNotification(topic: sns.Topic): void {
    const notificationFunction = new lambda.Function(this, 'DeploymentNotificationFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
        
        exports.handler = async (event) => {
          const topicArn = process.env.TOPIC_ARN;
          const cloudFrontUrl = process.env.CLOUDFRONT_URL;
          
          const sns = new SNSClient({});
          
          try {
            await sns.send(new PublishCommand({
              TopicArn: topicArn,
              Subject: '🚀 SPA Hosting Stack Deployed',
              Message: \`Stack deployment complete!

CloudFront URL: \${cloudFrontUrl}

Next steps:
1. Authorize the CodeStar Connection in the AWS Console
2. Push changes to your GitHub repository to trigger the pipeline

Your SPA migration infrastructure is ready!\`
            }));
            
            return { Status: 'SUCCESS' };
          } catch (error) {
            console.error('Error sending notification:', error);
            return { Status: 'FAILED' };
          }
        };
      `),
      environment: {
        TOPIC_ARN: topic.topicArn,
        CLOUDFRONT_URL: `https://${this.distribution.distributionDomainName}`,
      },
    });

    topic.grantPublish(notificationFunction);

    // Create custom resource to trigger notification on stack deployment
    new cr.AwsCustomResource(this, 'DeploymentNotification', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: notificationFunction.functionName,
          InvocationType: 'Event',
        },
        physicalResourceId: cr.PhysicalResourceId.of('DeploymentNotification'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [notificationFunction.functionArn],
        }),
      ]),
    });
  }
}
