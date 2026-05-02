import type { IDisbursementJobPublisher } from '../../../src/application/ports/disbursement-job-publisher.port';
import { PublishDisbursementJobUseCase } from '../../../src/application/use-cases/publish-disbursement-job.use-case';

const mockDisbursementJobPublisher: IDisbursementJobPublisher = {
  publishDisbursementJob: jest.fn().mockResolvedValue('msg-123'),
};

describe('PublishDisbursementJobUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes a disbursement job and returns its message id', async () => {
    const useCase = new PublishDisbursementJobUseCase(mockDisbursementJobPublisher);

    const result = await useCase.execute({ loanId: 'loan-123' });

    expect(result).toEqual({ loanId: 'loan-123', messageId: 'msg-123' });
    expect(mockDisbursementJobPublisher.publishDisbursementJob).toHaveBeenCalledWith('loan-123');
  });

  it('propagates publisher errors', async () => {
    const publisher: IDisbursementJobPublisher = {
      publishDisbursementJob: jest.fn().mockRejectedValue(new Error('SQS unavailable')),
    };
    const useCase = new PublishDisbursementJobUseCase(publisher);

    await expect(useCase.execute({ loanId: 'loan-123' })).rejects.toThrow('SQS unavailable');
  });
});
