import type { Handler } from 'aws-lambda';
import { LoanLogger } from '../../../infrastructure/logging/loan-logger';

interface RiskInput {
  loanId: string;
}

interface RiskOutput {
  loanId: string;
  approved: boolean;
  riskScore: number;
}

export const handler: Handler<RiskInput, RiskOutput> = async (event) => {
  const logger = new LoanLogger({ loanId: event.loanId });
  logger.info('user-risk-handler invoked');

  // TODO: implement credit scoring logic
  const output = simulateCreditScoring(event.loanId);
  logger.info('risk assessment completed', { riskScore: output.riskScore, approved: output.approved });
  return output;
};

function simulateCreditScoring(loanId: string): RiskOutput {
  return { loanId, approved: true, riskScore: 720 };
}
