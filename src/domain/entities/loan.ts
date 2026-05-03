import { LoanStatus } from "../value-objects/loan-status";

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

export interface UpdateLoanParams {
    status?: LoanStatus;
    stepFunctionExecutionArn?: string | undefined;
    identityVerified?: boolean;
}
