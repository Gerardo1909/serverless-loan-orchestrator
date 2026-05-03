import type { APIGatewayProxyEventPathParameters, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { GetLoanStatusUseCase } from '../../../../application/use-cases/get-loan-status.use-case';
import { getDynamoDocumentClient } from '../../../../infrastructure/config/aws-clients';
import { LoanLogger } from '../../../../infrastructure/logging/loan-logger';
import { DynamoLoanRepository } from '../../../../infrastructure/persistence/dynamo-loan-repository';

const repository = new DynamoLoanRepository(getDynamoDocumentClient());
const useCase = new GetLoanStatusUseCase(repository);

export const handler: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  const loanId = extractLoanId(event.pathParameters);
  const logger = new LoanLogger({
    requestId: context.awsRequestId,
    ...(loanId !== null ? { loanId } : {}),
  });

  if (!loanId) {
    logger.warn('get-status called without loanId path parameter');
    return respond(400, { error: 'loanId path parameter is required' });
  }

  logger.info('get-status invoked');
  return fetchLoanStatus(useCase, loanId, logger);
};

function extractLoanId(pathParameters: APIGatewayProxyEventPathParameters | null): string | null {
  return pathParameters?.['loanId'] ?? null;
}

async function fetchLoanStatus(
  loanStatusUseCase: GetLoanStatusUseCase,
  loanId: string,
  logger: LoanLogger,
): Promise<APIGatewayProxyResult> {
  try {
    const result = await loanStatusUseCase.execute(loanId);
    if (result === null) {
      logger.warn('loan not found');
      return respond(404, { error: 'Loan not found' });
    }
    logger.info('loan status retrieved', { status: result.status });
    return respond(200, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('failed to retrieve loan status', { error: message });
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
