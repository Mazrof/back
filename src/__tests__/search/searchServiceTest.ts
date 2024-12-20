import * as searchService from '../../services/searchService';
import * as searchRepository from '../../repositories/searchRepository';

jest.mock('../../repositories/searchRepository');

describe('Search Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch profiles by username', async () => {
    const username = 'john';
    const mockUsers = [
      {
        id: '1',
        name: 'john_doe',
        email: 'john@example.com',
        photo: null,
        screenname: 'JohnD',
        phone: '1234567890',
        publickey: 'abcd1234',
        lastseen: new Date(),
        activenow: true,
      },
    ];

    // Mock the repository method
    (searchRepository.findProfilesByUsername as jest.Mock).mockResolvedValue(
      mockUsers
    );

    const profiles = await searchService.getProfileByUsername(username);

    expect(profiles).toEqual([
      {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        photo: null,
        screenName: 'JohnD',
        phone: '1234567890',
        publicKey: 'abcd1234',
        lastSeen: expect.any(Date),
        activeNow: true,
      },
    ]);
  });

  it('should return empty array if no profiles found', async () => {
    const username = 'nonexistentuser';

    // Mock the repository to return null or empty array
    (searchRepository.findProfilesByUsername as jest.Mock).mockResolvedValue(
      null
    );

    const profiles = await searchService.getProfileByUsername(username);

    expect(profiles).toEqual([]);
  });

  it('should fetch groups by group name', async () => {
    const groupName = 'developers';
    const mockGroups = [
      {
        id: '1',
        groupsize: 50,
        name: 'developers',
        privacy: 'public',
        imageurl: 'group_image_url',
      },
    ];

    // Mock the repository method
    (searchRepository.findGroupByGroupName as jest.Mock).mockResolvedValue(
      mockGroups
    );

    const groups = await searchService.getGroupByGroupName(groupName);

    expect(groups).toEqual([
      {
        id: '1',
        groupSize: 50,
        community: {
          name: 'developers',
          privacy: 'public',
          imageURL: 'group_image_url',
        },
      },
    ]);
  });

  it('should return empty array if no groups found', async () => {
    const groupName = 'nonexistentgroup';

    // Mock the repository to return null or empty array
    (searchRepository.findGroupByGroupName as jest.Mock).mockResolvedValue(
      null
    );

    const groups = await searchService.getGroupByGroupName(groupName);

    expect(groups).toEqual([]);
  });

  it('should fetch channels by channel name', async () => {
    const channelName = 'tech_talk';
    const mockChannels = [
      {
        id: '1',
        invitationlink: 'link_to_channel',
        canaddcomments: true,
        name: 'tech_talk',
        privacy: 'public',
        imageurl: 'channel_image_url',
      },
    ];

    // Mock the repository method
    (searchRepository.findChannelByChannelName as jest.Mock).mockResolvedValue(
      mockChannels
    );

    const channels = await searchService.getChannelByChannelName(channelName);

    expect(channels).toEqual([
      {
        id: '1',
        invitationLink: 'link_to_channel',
        canAddComments: true,
        community: {
          name: 'tech_talk',
          privacy: 'public',
          imageURL: 'channel_image_url',
        },
      },
    ]);
  });

  it('should return empty array if no channels found', async () => {
    const channelName = 'nonexistentchannel';

    // Mock the repository to return null or empty array
    (searchRepository.findChannelByChannelName as jest.Mock).mockResolvedValue(
      null
    );

    const channels = await searchService.getChannelByChannelName(channelName);

    expect(channels).toEqual([]);
  });
});
