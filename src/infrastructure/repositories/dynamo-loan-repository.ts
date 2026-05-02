import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Loan } from '../../domain/entities/loan';
import type { ILoanRepository } from '../../domain/repositories/loan-repository';

export class DynamoLoanRepository implements ILoanRepository {
  constructor(private readonly client: DynamoDBDocumentClient) {}

  private get tableName(): string {
    const name = process.env['LOAN_TABLE_NAME'];
    if (!name) throw new Error('LOAN_TABLE_NAME env var not set');
    return name;
  }

  async save(loan: Loan): Promise<void> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            PK: `LOAN#${loan.loanId}`,
            SK: '#METADATA',
            GSI1PK: `USER#${loan.applicantIdNumber}`,
            GSI1SK: `LOAN#${loan.createdAt}`,
            ...loan,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        }),
      );
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw new Error(`Loan ${loan.loanId} already exists`);
      }
      throw err;
    }
  }

  async findById(loanId: string): Promise<Loan | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `LOAN#${loanId}`, SK: '#METADATA' },
      }),
    );

    if (!result.Item) return null;
    return result.Item as Loan;
  }

  async updateStepFunctionArn(loanId: string, executionArn: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { PK: `LOAN#${loanId}`, SK: '#METADATA' },
        UpdateExpression: 'SET stepFunctionExecutionArn = :arn, updatedAt = :now',
        ExpressionAttributeValues: {
          ':arn': executionArn,
          ':now': new Date().toISOString(),
        },
      }),
    );
  }
}
