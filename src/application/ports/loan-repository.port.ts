import type { Loan, UpdateLoanParams } from "../../domain/entities/loan";

export interface ILoanRepository {
    save(loan: Loan): Promise<void>;
    update(loanId: string, params: UpdateLoanParams): Promise<void>;
    findById(loanId: string): Promise<Loan | null>;
}
