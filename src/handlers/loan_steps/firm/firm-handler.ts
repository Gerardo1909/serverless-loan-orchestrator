import type { Handler } from 'aws-lambda';
import { LoanLogger } from '../../../infrastructure/logger/loan-logger';

interface FirmInput {
  loanId: string;
}

interface FirmOutput {
  loanId: string;
  signed: boolean;
  contractHash: string;
}

export const handler: Handler<FirmInput, FirmOutput> = async (event) => {
  const logger = new LoanLogger({ loanId: event.loanId });
  logger.info('firm-handler invoked');

  // TODO: generate and wait for contract signature (callback pattern)
  const output = generateContractSignature(event.loanId);
  logger.info('contract signed', { contractHash: output.contractHash });
  return output;
};

function generateContractSignature(loanId: string): FirmOutput {
  const contractHash = Buffer.from(`contract-${loanId}-${Date.now()}`).toString('base64');
  return { loanId, signed: true, contractHash };
}
