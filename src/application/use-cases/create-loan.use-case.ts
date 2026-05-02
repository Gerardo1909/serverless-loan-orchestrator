import type { ILoanWorkflowStarter } from '../ports/loan-workflow-starter.port';
import { createLoan } from '../../domain/entities/loan';
import type { ILoanRepository } from '../../domain/repositories/loan-repository';
import { LoanStatus } from '../../domain/types/loan-status';
import type { CreateLoanInput } from '../schemas/create-loan.schema';

export interface CreateLoanOutput {
  loanId: string;
  status: LoanStatus;
}

export class CreateLoanUseCase {
  constructor(
    private readonly repository: ILoanRepository,
    private readonly loanWorkflowStarter: ILoanWorkflowStarter,
  ) {}

  async execute(input: CreateLoanInput): Promise<CreateLoanOutput> {
    const loan = createLoan(input);

    await this.repository.save(loan);

    const executionArn = await this.loanWorkflowStarter.startLoanWorkflow(loan.loanId);
    await this.repository.updateStepFunctionArn(loan.loanId, executionArn);

    return { loanId: loan.loanId, status: loan.status };
  }
}
