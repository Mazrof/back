// __mocks__/firebase-admin.js
module.exports = {
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  storage: jest.fn().mockReturnValue({
    bucket: jest.fn().mockReturnValue({}),
  }),
};
