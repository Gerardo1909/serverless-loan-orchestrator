import { LoanStatus } from "../../domain/value-objects/loan-status";
import type { ILoanRepository } from "../ports/loan-repository.port";
import type { IBankAuthService } from "../ports/bank-auth-service.port";

export interface BankAuthOutput {
    loanId: string;
    status: LoanStatus;
    identityVerified: boolean;
}

export class BankAuthUseCase {
    constructor(
        private readonly repository: ILoanRepository,
        private readonly authService: IBankAuthService,
    ) {}

    async execute(loanId: string): Promise<BankAuthOutput> {
        const loan = await this.repository.findById(loanId);
        const identityVerified = await this.authService.verifyIdentity(loan);

        if (!identityVerified) {
            throw new Error("Identity verification failed");
        }

        const status = LoanStatus.IDENTITY_VERIFICATION;

        await this.repository.update(loanId, { status, identityVerified });

        return { loanId, status, identityVerified };
    }
}
