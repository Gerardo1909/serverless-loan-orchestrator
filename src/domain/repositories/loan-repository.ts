import type { Loan } from '../entities/loan';

export interface ILoanRepository {
  save(loan: Loan): Promise<void>;
  findById(loanId: string): Promise<Loan | null>;
  updateStepFunctionArn(loanId: string, executionArn: string): Promise<void>;
}
