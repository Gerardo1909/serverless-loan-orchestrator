import { v4 as uuidv4 } from 'uuid';
import { LoanStatus } from '../types/loan-status';

export interface Loan {
  loanId: string;
  applicantName: string;
  applicantEmail: string;
  applicantIdNumber: string;
  applicantIncomeMonthly: number;
  amountCents: number;
  currency: string;
  termMonths: number;
  purpose: string;
  status: LoanStatus;
  idempotencyKey?: string | undefined;
  stepFunctionExecutionArn?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanParams {
  applicantName: string;
  applicantEmail: string;
  applicantIdNumber: string;
  applicantIncomeMonthly: number;
  amountCents: number;
  currency: string;
  termMonths: number;
  purpose: string;
  idempotencyKey?: string | undefined;
}

export function createLoan(params: CreateLoanParams): Loan {
  const now = new Date().toISOString();
  return {
    loanId: uuidv4(),
    ...params,
    status: LoanStatus.PENDING_REVIEW,
    createdAt: now,
    updatedAt: now,
  };
}
