import type { IDisbursementJobPublisher } from '../ports/disbursement-job-publisher.port';

export interface PublishDisbursementJobInput {
  loanId: string;
}

export interface PublishDisbursementJobOutput {
  loanId: string;
  messageId: string;
}

export class PublishDisbursementJobUseCase {
  constructor(private readonly disbursementJobPublisher: IDisbursementJobPublisher) {}

  async execute(input: PublishDisbursementJobInput): Promise<PublishDisbursementJobOutput> {
    const messageId = await this.disbursementJobPublisher.publishDisbursementJob(input.loanId);
    return { loanId: input.loanId, messageId };
  }
}
