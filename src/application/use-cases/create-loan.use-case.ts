import type { ILoanWorkflowStarter } from "../ports/loan-workflow-starter.port";
import type { ILoanRepository } from "../ports/loan-repository.port";
import { LoanStatus } from "../../domain/value-objects/loan-status";
import type { CreateLoanInput } from "../dtos/create-loan.dto";
import { v4 as uuidv4 } from "uuid";

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
        const now = new Date().toISOString();
        const loan = {
            loanId: uuidv4(),
            ...input,
            status: LoanStatus.PENDING_REVIEW,
            createdAt: now,
            updatedAt: now,
        };

        await this.repository.save(loan);

        const executionArn = await this.loanWorkflowStarter.startLoanWorkflow(
            loan.loanId,
        );
        await this.repository.update(loan.loanId, {
            stepFunctionExecutionArn: executionArn,
        });

        return { loanId: loan.loanId, status: loan.status };
    }
}
