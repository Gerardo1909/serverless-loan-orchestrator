import { SendMessageCommand, type SQSClient } from '@aws-sdk/client-sqs';
import type { IDisbursementJobPublisher } from '../../application/ports/disbursement-job-publisher.port';

export class SqsDisbursementJobPublisherAdapter implements IDisbursementJobPublisher {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string,
  ) {}

  async publishDisbursementJob(loanId: string): Promise<string> {
    const result = await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({ loanId }),
      }),
    );

    if (!result.MessageId) {
      throw new Error('SQS MessageId missing from SendMessage response');
    }

    return result.MessageId;
  }
}
