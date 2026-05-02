import type { Handler } from 'aws-lambda';
import { LoanLogger } from '../../../infrastructure/logger/loan-logger';

interface BankAuthInput {
  loanId: string;
}

interface BankAuthOutput {
  loanId: string;
  identityVerified: boolean;
}

export const handler: Handler<BankAuthInput, BankAuthOutput> = async (event) => {
  const logger = new LoanLogger({ loanId: event.loanId });
  logger.info('bank-auth-handler invoked');

  // TODO: integrate with KYC provider
  const output = simulateIdentityVerification(event.loanId);
  logger.info('identity verification completed', { identityVerified: output.identityVerified });
  return output;
};

function simulateIdentityVerification(loanId: string): BankAuthOutput {
  return { loanId, identityVerified: true };
}
