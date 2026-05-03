import type { ILoanRepository } from "../../../src/application/ports/loan-repository.port";
import { LoanStatus } from "../../../src/domain/value-objects/loan-status";
import { GetLoanStatusUseCase } from "../../../src/application/use-cases/get-loan-status.use-case";

const BASE_LOAN = {
    loanId: "loan-123",
    applicantName: "Ana García",
    applicantEmail: "ana@example.com",
    applicantIdNumber: "DNI-12345",
    applicantIncomeMonthly: 5000,
    amountCents: 1_000_000,
    currency: "USD",
    termMonths: 24,
    purpose: "home_improvement",
    status: LoanStatus.PENDING_REVIEW,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeRepository(loan: typeof BASE_LOAN | null): ILoanRepository {
    return {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(loan),
        update: jest.fn(),
    };
}

describe("GetLoanStatusUseCase", () => {
    it("returns status fields when loan exists", async () => {
        const loan = {
            ...BASE_LOAN,
            stepFunctionExecutionArn: "arn:aws:states:::execution/test",
        };
        const useCase = new GetLoanStatusUseCase(makeRepository(loan));

        const result = await useCase.execute("loan-123");

        expect(result).toEqual({
            loanId: "loan-123",
            status: LoanStatus.PENDING_REVIEW,
            stepFunctionExecutionArn: "arn:aws:states:::execution/test",
            createdAt: BASE_LOAN.createdAt,
            updatedAt: BASE_LOAN.updatedAt,
        });
    });

    it("omits stepFunctionExecutionArn when not set", async () => {
        const useCase = new GetLoanStatusUseCase(makeRepository(BASE_LOAN));

        const result = await useCase.execute("loan-123");

        expect(result).not.toBeNull();
        expect(result).not.toHaveProperty("stepFunctionExecutionArn");
    });

    it("returns null when loan does not exist", async () => {
        const useCase = new GetLoanStatusUseCase(makeRepository(null));

        const result = await useCase.execute("non-existent-id");

        expect(result).toBeNull();
    });

    it("propagates repository errors", async () => {
        const repository: ILoanRepository = {
            save: jest.fn(),
            findById: jest
                .fn()
                .mockRejectedValue(new Error("DynamoDB unavailable")),
            update: jest.fn(),
        };
        const useCase = new GetLoanStatusUseCase(repository);

        await expect(useCase.execute("loan-123")).rejects.toThrow(
            "DynamoDB unavailable",
        );
    });
});
