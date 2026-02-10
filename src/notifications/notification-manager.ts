import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

/**
 * NotificationManager handles SNS topic and subscription management
 */
export class NotificationManager {
  private readonly scope: Construct;
  private readonly topic: sns.Topic;
  private readonly email: string;

  constructor(scope: Construct, topic: sns.Topic, email: string) {
    this.scope = scope;
    this.topic = topic;
    this.email = email;
  }

  /**
   * Create email subscription for the SNS topic
   */
  createSubscription(): subscriptions.EmailSubscription {
    return new subscriptions.EmailSubscription(this.email);
  }

  /**
   * Get the SNS topic
   */
  getTopic(): sns.Topic {
    return this.topic;
  }
}
