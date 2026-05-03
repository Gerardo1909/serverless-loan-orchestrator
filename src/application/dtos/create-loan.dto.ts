import { z } from 'zod';

export const createLoanSchema = z.object({
  applicantName: z.string().min(2).max(200),
  applicantEmail: z.string().email(),
  applicantIdNumber: z.string().min(1).max(50),
  applicantIncomeMonthly: z.number().int().positive(),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3).default('USD'),
  termMonths: z.number().int().min(1).max(360),
  purpose: z.string().min(1).max(500),
  idempotencyKey: z.string().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
