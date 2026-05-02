import type { ILoanRepository } from '../../domain/repositories/loan-repository';

export interface GetLoanStatusOutput {
  loanId: string;
  status: string;
  stepFunctionExecutionArn?: string;
  createdAt: string;
  updatedAt: string;
}

export class GetLoanStatusUseCase {
  constructor(private readonly repository: ILoanRepository) {}

  async execute(loanId: string): Promise<GetLoanStatusOutput | null> {
    const loan = await this.repository.findById(loanId);
    if (loan === null) return null;

    return {
      loanId: loan.loanId,
      status: loan.status,
      ...(loan.stepFunctionExecutionArn !== undefined
        ? { stepFunctionExecutionArn: loan.stepFunctionExecutionArn }
        : {}),
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    };
  }
}
