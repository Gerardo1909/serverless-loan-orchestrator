import { StartExecutionCommand, type SFNClient } from '@aws-sdk/client-sfn';
import type { ILoanWorkflowStarter } from '../../application/ports/loan-workflow-starter.port';

export class SfnLoanWorkflowStarter implements ILoanWorkflowStarter {
  constructor(
    private readonly sfnClient: SFNClient,
    private readonly stateMachineArn: string,
  ) {}

  async startLoanWorkflow(loanId: string): Promise<string> {
    const execution = await this.sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: this.stateMachineArn,
        name: loanId,
        input: JSON.stringify({ loanId }),
      }),
    );

    if (!execution.executionArn) {
      throw new Error('Step Functions executionArn missing from StartExecution response');
    }

    return execution.executionArn;
  }
}
