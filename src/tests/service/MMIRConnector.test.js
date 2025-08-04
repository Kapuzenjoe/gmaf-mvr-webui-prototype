import MMIRConnector from '../../service/MMIRConnector';
import { guessMimeType } from '../../utils/MimeTypeHelper';

global.fetch = jest.fn();

describe('MMIRConnector Flow', () => {
  beforeEach(() => {
    MMIRConnector.setBaseUrl('http://fake-mmir.com');
    MMIRConnector.token = null;
    fetch.mockClear();
  });

  test('should connect, authenticate, query, and load ZIP file metadata', async () => {
    const fakeToken = 'SESSION_TOKEN_123';
    const fakeQueryIDs = ['mmfg1'];
    const fakeMMFG = {
      generalMetadata: {
        id: 'mmfg1',
        fileName: 'test.zip'
      }
    };

    // getToken
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => fakeToken,
      json: async () => fakeToken,
    });

    const token = await MMIRConnector.getToken('appKey-xyz');
    expect(token).toBe(fakeToken);
    expect(MMIRConnector.isConnected()).toBe(true);

    // sendQuery
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeQueryIDs
    });

    // getAllData for each ID
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeMMFG
    });

    // fetch MIME type
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'application/zip'
      }
    });

    const result = await MMIRConnector.sendQuery({ md: { keywords: 'zip' } });

    expect(result.results.length).toBe(1);
    const item = result.results[0];
    expect(item.generalMetadata.fileName).toBe('test.zip');
    expect(item.mimeType).toBe('application/zip');
    expect(item.fileUrl).toContain('/gmaf/file/');

    // Fallback MIME type check
    const guessed = guessMimeType('archive.zip');
    expect(guessed).toBe('application/zip');
  });

  test('should handle empty keyword query gracefully', async () => {
    const fakeToken = 'SESSION_TOKEN_EMPTY';
    const fakeQueryIDs = [];

    // getToken
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => fakeToken,
      json: async () => fakeToken,
    });

    await MMIRConnector.getToken('any-key');

    // post for sendQuery → returns empty array
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeQueryIDs,
    });

    const result = await MMIRConnector.sendQuery(); // no keywords

    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBe(0);
  });


});
