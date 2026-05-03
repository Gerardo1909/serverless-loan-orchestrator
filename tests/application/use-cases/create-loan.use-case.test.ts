import type { ILoanWorkflowStarter } from "../../../src/application/ports/loan-workflow-starter.port";
import type { ILoanRepository } from "../../../src/application/ports/loan-repository.port";
import { LoanStatus } from "../../../src/domain/value-objects/loan-status";
import { CreateLoanUseCase } from "../../../src/application/use-cases/create-loan.use-case";

const mockRepository: ILoanRepository = {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
};

const mockLoanWorkflowStarter: ILoanWorkflowStarter = {
    startLoanWorkflow: jest
        .fn()
        .mockResolvedValue("arn:aws:states:::execution/test/run1"),
};

describe("CreateLoanUseCase", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("saves the loan and starts a Step Functions execution", async () => {
        const useCase = new CreateLoanUseCase(
            mockRepository,
            mockLoanWorkflowStarter,
        );
        const result = await useCase.execute({
            applicantName: "Ana García",
            applicantEmail: "ana@example.com",
            applicantIdNumber: "DNI-12345",
            applicantIncomeMonthly: 5000,
            amountCents: 1_000_000,
            currency: "USD",
            termMonths: 24,
            purpose: "home_improvement",
        });

        expect(result.status).toBe(LoanStatus.PENDING_REVIEW);
        expect(typeof result.loanId).toBe("string");
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(mockLoanWorkflowStarter.startLoanWorkflow).toHaveBeenCalledTimes(
            1,
        );
        expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });
});
