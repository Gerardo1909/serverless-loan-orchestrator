import type { Loan } from "../../domain/entities/loan";

export interface IBankAuthService {
  verifyIdentity(loan: Loan | null): Promise<boolean>;
}
