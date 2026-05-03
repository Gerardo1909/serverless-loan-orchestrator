import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Loan, UpdateLoanParams } from "../../domain/entities/loan";
import type { ILoanRepository } from "../../application/ports/loan-repository.port";

export class DynamoLoanRepository implements ILoanRepository {
    constructor(private readonly client: DynamoDBDocumentClient) {}

    private get tableName(): string {
        const name = process.env["LOAN_TABLE_NAME"];
        if (!name) throw new Error("LOAN_TABLE_NAME env var not set");
        return name;
    }

    async save(loan: Loan): Promise<void> {
        try {
            await this.client.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: {
                        PK: `LOAN#${loan.loanId}`,
                        SK: "#METADATA",
                        GSI1PK: `USER#${loan.applicantIdNumber}`,
                        GSI1SK: `LOAN#${loan.createdAt}`,
                        ...loan,
                    },
                    ConditionExpression: "attribute_not_exists(PK)",
                }),
            );
        } catch (err) {
            if (err instanceof ConditionalCheckFailedException) {
                throw new Error(`Loan ${loan.loanId} already exists`);
            }
            throw err;
        }
    }

    async update(loanId: string, params: UpdateLoanParams): Promise<void> {
        const expressions: string[] = [];
        const values: Record<string, any> = {};

        for (const [key, value] of Object.entries(params)) {
            if (value === undefined) continue;

            const attributeKey = `#${key}`;
            const valueKey = `:${key}`;

            expressions.push(`${attributeKey} = ${valueKey}`);
            values[valueKey] = value;
        }

        expressions.push("#updatedAt = :now");
        values[":now"] = new Date().toISOString();

        const names = Object.fromEntries(
            Object.keys(params).map((k) => [`#${k}`, k]),
        );
        names["#updatedAt"] = "updatedAt";

        await this.client.send(
            new UpdateCommand({
                TableName: this.tableName,
                Key: { PK: `LOAN#${loanId}`, SK: "#METADATA" },
                UpdateExpression: `SET ${expressions.join(", ")}`,
                ExpressionAttributeValues: values,
                ExpressionAttributeNames: names,
            }),
        );
    }

    async findById(loanId: string): Promise<Loan | null> {
        const result = await this.client.send(
            new GetCommand({
                TableName: this.tableName,
                Key: { PK: `LOAN#${loanId}`, SK: "#METADATA" },
            }),
        );

        if (!result.Item) return null;
        return result.Item as Loan;
    }
}
