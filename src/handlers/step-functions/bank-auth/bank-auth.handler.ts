import type { Handler } from "aws-lambda";
import { LoanLogger } from "../../../infrastructure/logging/loan-logger";

interface BankAuthInput {
    loanId: string;
}

interface BankAuthOutput {
    loanId: string;
    identityVerified: boolean;
}

export const handler: Handler<BankAuthInput, BankAuthOutput> = async (
    event,
) => {
    const logger = new LoanLogger({ loanId: event.loanId });
    logger.info("bank-auth-handler invoked");

    const output = IdentityVerification(event.loanId);
    logger.info("identity verification completed", {
        identityVerified: output.identityVerified,
    });
    return output;
};

function IdentityVerification(loanId: string): BankAuthOutput {
    return { loanId, identityVerified: true };
}
