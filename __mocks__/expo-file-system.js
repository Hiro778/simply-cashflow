module.exports = {
  Paths: {
    document: '/mock/documents',
  },
  File: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    write: jest.fn(),
    uri: '/mock/documents/test.json',
  })),
};
