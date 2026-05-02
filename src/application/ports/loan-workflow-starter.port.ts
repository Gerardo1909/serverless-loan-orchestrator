export interface ILoanWorkflowStarter {
  startLoanWorkflow(loanId: string): Promise<string>;
}
