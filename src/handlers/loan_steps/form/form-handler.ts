import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { type CreateLoanInput, createLoanSchema } from '../../../application/schemas/create-loan.schema';
import { CreateLoanUseCase, type CreateLoanOutput } from '../../../application/use-cases/create-loan.use-case';
import { getDynamoDocumentClient, getSfnClient } from '../../../infrastructure/aws/clients';
import { SfnLoanWorkflowStarterAdapter } from '../../../infrastructure/adapters/sfn-loan-workflow-starter.adapter';
import { LoanLogger } from '../../../infrastructure/logger/loan-logger';
import { DynamoLoanRepository } from '../../../infrastructure/repositories/dynamo-loan-repository';

const repository = new DynamoLoanRepository(getDynamoDocumentClient());
const workflowStarter = new SfnLoanWorkflowStarterAdapter(getSfnClient(), resolveStateMachineArn());
const useCase = new CreateLoanUseCase(repository, workflowStarter);

export const handler: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  const logger = new LoanLogger({ requestId: context.awsRequestId });
  logger.info('form-handler invoked');

  const body = parseBody(event.body);
  if (body === null) {
    return respond(400, { error: 'Invalid JSON body' });
  }

  const validation = validateInput(body);
  if (!validation.success) {
    return respond(400, { error: 'Validation failed', details: validation.error.flatten() });
  }

  return submitLoanApplication(useCase, validation.data, logger);
};

function parseBody(rawBody: string | null): unknown {
  try {
    return JSON.parse(rawBody ?? '{}');
  } catch {
    return null;
  }
}

function validateInput(body: unknown) {
  return createLoanSchema.safeParse(body);
}

function resolveStateMachineArn(): string {
  const stateMachineArn = process.env['LOAN_STATE_MACHINE_ARN'];
  if (!stateMachineArn) throw new Error('LOAN_STATE_MACHINE_ARN env var not set');
  return stateMachineArn;
}

async function submitLoanApplication(
  loanUseCase: CreateLoanUseCase,
  input: CreateLoanInput,
  logger: LoanLogger,
): Promise<APIGatewayProxyResult> {
  try {
    const result: CreateLoanOutput = await loanUseCase.execute(input);
    logger.info('loan application submitted', { loanId: result.loanId, status: result.status });
    return respond(201, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('failed to submit loan application', { error: message });
    return respond(500, { error: message });
  }
}

function respond(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
