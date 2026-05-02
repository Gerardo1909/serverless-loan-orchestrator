export interface IDisbursementJobPublisher {
  publishDisbursementJob(loanId: string): Promise<string>;
}
