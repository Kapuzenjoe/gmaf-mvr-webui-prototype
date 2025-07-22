import { guessMimeType } from '../utils/MimeTypeHelper';
/**
 * Static service class for interacting with an MMIR system via HTTP REST API.
 * Handles authentication, query execution, and result parsing.
 */
class MMIRConnector {
  static baseUrl = '';
  static token = null;

  /**
   * Sets the base URL for MMIR system communication.
   * @param {string} url - Base URL
   */
  static setBaseUrl(url) {
    MMIRConnector.baseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Requests an authentication token from the MMIR system using an app key.
   * @param {string} appKey - App Key used for authentication.
   * @returns {Promise<string>} - The received token.
   * @throws {Error} - If the base URL is not set or the token fetch fails.
   */
  static async getToken(appKey) {
    if (!MMIRConnector.baseUrl) throw new Error('Base URL is not set.');
    const endpoint = `/gmaf/getToken/${encodeURIComponent(appKey)}`;
    const result = await MMIRConnector.get(endpoint);
    if (result) {
      MMIRConnector.token = result;
      return result;
    } else {
      throw new Error('No token received');
    }
  }

  /**
   * Returns the current token value.
   * @returns {string|null} - The current token, or null if not authenticated.
   */
  static getTokenValue() {
    return MMIRConnector.token;
  }

  /**
   * Indicates if a valid token is present.
   * @returns {boolean} - True if connected.
   */
  static isConnected() {
    return !!MMIRConnector.token;
  }

  /**
   * Sends a keyword-based query to the MMIR system.
   * Fetches results and their associated metadata.
   * @param {object} query - The query object.
   * @param {function} [onProgress] - Optional progress callback (done, total).
   * @returns {Promise<{ results: object[] }>} - Array of result entries.
   */
  static async sendQuery(query = {}, onProgress = null) {
    const keywords = query?.md?.keywords || '';
    const queryIDs = await this.post(`/gmaf/query/${this.token}/${keywords}`, 'json');
    const queryResults = [];

    if (Array.isArray(queryIDs)) {
      const total = queryIDs.length;

      for (let i = 0; i < total; i++) {
        const collectionElement = await this.getAllData(queryIDs[i]);
        queryResults.push(collectionElement);
        if (typeof onProgress === 'function') {
          onProgress(i + 1, total);
        }
      }
    }

    return { results: queryResults };
  }

  /**
   * Loads metadata and enhances it with fileUrl and MIME type.
   * @param {string} queryId - Unique result identifier.
   * @returns {Promise<object|null>} - Result with enriched metadata or null.
   */
  static async getAllData(queryId) {
    if (!queryId) return null;

    const collectionElement = await this.post(`/gmaf/getmmfg/${this.token}/${queryId}`, 'json');

    if (collectionElement?.generalMetadata?.fileName) {
      const fileName = collectionElement.generalMetadata.fileName;
      const fallbackMime = guessMimeType(fileName);

      collectionElement.fileUrl = `${this.baseUrl}/gmaf/file/${this.token}/${collectionElement.generalMetadata.id}`;
      collectionElement.mimeType = await this.fetchMimeType(collectionElement.fileUrl) || fallbackMime;
      collectionElement.mmcoType = 'default'; //toDo an Datenstruktur anpassen
      collectionElement.cmmco = { hasReferences: false, references: [] }; //toDo an Datenstruktur anpassen
      collectionElement.cmmco.hasReferences = collectionElement.cmmco.references.length > 0; //toDo an Datenstruktur anpassen
    }

    return collectionElement;
  }

  /**
   * Get MIME Type from Item
   * @param {string} url - URL 
   * @returns {Promise<object>} - MIME Type
   */
  static async fetchMimeType(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) throw new Error(`HEAD failed: ${response.status}`);
      return response.headers.get('Content-Type');
    } catch (err) {
      console.error('Failed to get MIME-Type:', err);
      return null;
    }
  }

  /**
   * Performs a GET request to the given path.
   * @param {string} path - URL path after base URL.
   * @param {string} [type=""] - Optional response type: "", "json", or "blob".
   * @returns {Promise<any>} - Parsed response content.
   */
  static async get(path, type = "") {
    const fullUrl = `${MMIRConnector.baseUrl}${path}`;
    try {
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`GET failed (${res.status})`);

      if (type === "blob") return await res.blob();
      if (type === "json") return await res.json();
      return await res.text();
    } catch (error) {
      console.error('GET Error:', error);
      throw error;
    }
  }

  /**
   * Performs a POST request to the given path.
   * @param {string} path - URL path.
   * @param {boolean|string} jsonResponse - Whether to parse response as JSON.
   * @param {object} [body={}] - Request body payload.
   * @returns {Promise<any>} - Parsed response if JSON, otherwise raw text.
   * @throws {Error} - If request fails or token is missing.
   */
  static async post(path, jsonResponse = false, body = {}) {
    if (!this.token) {
      throw new Error("GMAF Token not set");
    }
    const fullUrl = `${MMIRConnector.baseUrl}${path}`;

    try {
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {},
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`POST failed (${res.status})`);

      if (jsonResponse) {
        return await res.json();
      }

      return await res.text();
    } catch (error) {
      console.error('POST Error:', error);
      throw error;
    }
  }
}

export default MMIRConnector;
