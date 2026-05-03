import type { SQSHandler, SQSRecord } from 'aws-lambda';
import { LoanLogger } from '../../../infrastructure/logging/loan-logger';

interface DisbursementMessage {
  loanId: string;
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};

async function processRecord(record: SQSRecord): Promise<void> {
  const message = parseDisbursementMessage(record.body);
  const logger = new LoanLogger({ loanId: message.loanId });
  logger.info('processing disbursement', { messageId: record.messageId });

  // TODO: call disbursement service / banking API
}

function parseDisbursementMessage(body: string): DisbursementMessage {
  return JSON.parse(body) as DisbursementMessage;
}
