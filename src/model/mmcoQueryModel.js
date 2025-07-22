/**
 * Represents a model for building MMCO queries.
 * Encapsulates the query structure and provides methods to modify it.
 * -> currently only query-by-keyword is implemented!
 */
export default class mmcoQueryModel {
  /**
   * Initializes a new query model with optional MMCO identifier.
   * @param {string} mmco - Optional MMCO string identifier.
   */
  constructor(mmco = '') {
    this.mmco = mmco;
    this.query = {
      srd: {},
      pd: {},
      mmco: this.mmco,
      md: { keywords: '' },
      wsd: {},
    };
  }

  /**
   * Resets the query object to its initial empty structure,
   * retaining the current MMCO identifier.
   */
  reset() {
    this.query = {
      srd: {},
      pd: {},
      mmco: this.mmco,
      md: { keywords: '' },
      wsd: {},
    };
  }

  /**
   * Sets the MMCO identifier used in the query.
   * @param {string} value - The MMCO value to be used.
   */
  setMMCO(value) {
    this.mmco = value;
    this.query.mmco = value;
  }

  /**
   * Sets the keywords for the query-by-keyword Search.
   * Cleans and joins an array of keywords into a single string.
   * @param {string[]} keywords - List of keyword strings.
   */
  setKeywords(keywords) {
    const cleaned = Array.isArray(keywords)
      ? keywords.map(k => k.trim()).filter(k => k.length > 0).join(',')
      : '';
    this.query.md.keywords = cleaned;
  }

  /**
   * Returns the current query object structure.
   * @returns {object} The internal query object.
   */
  get() {
    return this.query;
  }
}