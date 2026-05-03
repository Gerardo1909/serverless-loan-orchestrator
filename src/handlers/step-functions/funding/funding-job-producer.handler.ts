import type { Handler } from 'aws-lambda';
import { PublishDisbursementJobUseCase } from '../../../application/use-cases/publish-disbursement-job.use-case';
import { getSqsClient } from '../../../infrastructure/config/aws-clients';
import { SqsDisbursementJobPublisher } from '../../../infrastructure/messaging/sqs-disbursement-job-publisher';
import { LoanLogger } from '../../../infrastructure/logging/loan-logger';

interface FundingJobInput {
  loanId: string;
}

interface FundingJobOutput {
  loanId: string;
  messageId: string;
}

const disbursementJobPublisher = new SqsDisbursementJobPublisher(
  getSqsClient(),
  resolveDisbursementQueueUrl(),
);
const publishDisbursementJobUseCase = new PublishDisbursementJobUseCase(disbursementJobPublisher);

export const handler: Handler<FundingJobInput, FundingJobOutput> = async (event) => {
  const logger = new LoanLogger({ loanId: event.loanId });
  logger.info('funding-job-producer invoked');

  const result = await publishDisbursementJobUseCase.execute({ loanId: event.loanId });
  logger.info('disbursement job enqueued', { messageId: result.messageId });
  return result;
};

function resolveDisbursementQueueUrl(): string {
  const queueUrl = process.env['DISBURSEMENT_QUEUE_URL'];
  if (!queueUrl) throw new Error('DISBURSEMENT_QUEUE_URL env var not set');
  return queueUrl;
}
