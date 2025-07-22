import MMIRConnector from './MMIRConnector';
import mmcoQueryModel from '../model/mmcoQueryModel';

/**
 * Service class for managing MMCO-based search queries.
 * Handles lifecycle: model creation, keyword updates, and submission.
 * >>> Currently supports query-by-keyword only.
 */
class SearchQueryService {
  /** @type {mmcoQueryModel} */
  constructor() {
    this.model = new mmcoQueryModel();
  }

  /**
   * Sets the MMCO identifier in the current query model.
   * @param {string} value - The MMCO value to be used.
   */
  setMMCO(value) {
    this.model.setMMCO(value);
  }

  /**
   * Resets the query model to its initial state.
   */
  resetQuery() {
    this.model.reset();
  }

  /**
   * Returns the current query object.
   * @returns {object} The full query object from the model.
   */
  getQueryObject() {
    return this.model.get();
  }

  /**
   * Submits a query-by-keyword search using the MMIRConnector.
   * Updates the query model with the provided keywords and delegates the request.
   *
   * @param {string[]} keywords - List of keyword strings.
   * @param {function} [onProgress=null] - Optional callback for progress updates during query processing.
   * @returns {Promise<object>} The Query response returned by the MMIRConnector.
   * @throws Will throw an error if no keywords are provided or the query fails.
   */
  async submitKeywordQuery(keywords, onProgress = null) {

    if (keywords.length === 0) {
      throw new Error('No keywords provided.');
    }

    this.model.setKeywords(keywords);

    try {
      const response = await MMIRConnector.sendQuery(this.model.get(), onProgress);
      console.log("sendQueryResponse", response) //Debug
      return response;
    } catch (err) {
      console.error('SearchQueryService error:', err);
      throw err;
    }
  }
}

export default SearchQueryService;
