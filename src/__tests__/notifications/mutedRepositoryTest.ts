import prisma from '../../prisma/client';
import { MuteDuration } from '@prisma/client';
import { 
  getUserMutedParticipants,
  addMutedParticipant,
  removeMutedParticipant,
  removeExpiredMutedParticipants,
  updateMutedParticipant
} from '../../repositories/MutedChatsRepository';

jest.mock('../../prisma/client', () => ({
  participants: {
    findUnique: jest.fn(),
  },
  mutedParticipants: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
  },
  communities: {
    findUnique: jest.fn(),
  },
  groups: {
    findUnique: jest.fn(),
  },
  channels: {
    findUnique: jest.fn(),
  },
}));

describe('Your Service', () => {

  const mockParticipantId = 1;
  const mockUserId = 2;

  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('getUserMutedParticipants', () => {
    it('should return non-expired muted participants', async () => {
      const mockMutedParticipants = [
        { userId: 1, expiryDate: new Date(Date.now() + 3600 * 1000), participantId: mockParticipantId },
        { userId: 2, expiryDate: new Date(Date.now() - 3600 * 1000), participantId: mockParticipantId }
      ];
      (prisma.mutedParticipants.findMany as jest.Mock).mockResolvedValue(mockMutedParticipants);

      const result = await getUserMutedParticipants(mockParticipantId);

      expect(result).toEqual([1]);
    });
  });

  describe('addMutedParticipant', () => {
    it('should add a muted participant', async () => {
      const mockExpiryDate = new Date(Date.now() + 3600 * 1000);
      const muteDuration: MuteDuration = MuteDuration.oneHour;
      (prisma.mutedParticipants.create as jest.Mock).mockResolvedValue({ userId: mockUserId, participantId: mockParticipantId, expiryDate: mockExpiryDate });

      const result = await addMutedParticipant(mockParticipantId, mockUserId, muteDuration);

      expect(result).toEqual({ userId: mockUserId, participantId: mockParticipantId, expiryDate: mockExpiryDate });
    });
  });

  describe('removeMutedParticipant', () => {
    it('should remove a muted participant', async () => {
      (prisma.mutedParticipants.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await removeMutedParticipant(mockParticipantId, mockUserId);

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('removeExpiredMutedParticipants', () => {
    it('should remove expired muted participants', async () => {
      const expiredParticipants = [{ participantId: mockParticipantId, userId: mockUserId }];
      (prisma.mutedParticipants.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await removeExpiredMutedParticipants(expiredParticipants);

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('updateMutedParticipant', () => {
    it('should update a muted participant', async () => {
      const muteDuration: MuteDuration = MuteDuration.oneHour;
      (prisma.mutedParticipants.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await updateMutedParticipant(mockParticipantId, mockUserId, muteDuration);

      expect(result).toEqual({ count: 1 });
    });
  });
});
