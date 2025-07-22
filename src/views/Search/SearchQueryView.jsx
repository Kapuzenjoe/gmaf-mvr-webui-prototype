import React, { Component } from 'react';
import styles from './SearchQueryView.module.css';

import SearchQueryService from '../../service/SearchQueryService';

/**
 * A view component that allows users to enter search queries.
 * Queries are processed and sent to the backend via the SearchQueryService.
 * Displays a progress bar during the search process and communicates results to the parent.
 */
class SearchQueryView extends Component {
  /**
   * @param {object} props - React props, including `onSearchResults` callback.
   */
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',       // Text input value
      keywords: [],         // Array of entered keywords
      isLoading: false,     // Indicates whether a search is in progress
      loadingProgress: 0,   // Progress percentage during query
      results: [],          // Stores result objects
    };
    this.searchService = new SearchQueryService();
  }

  /**
   * Handles live input updates.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  /**
   * Parses the input field and adds valid keywords.
   */
  handleInputEnter = () => {
    const { inputValue, keywords } = this.state;
    if (!inputValue.trim()) return;

    const parsed = inputValue
      .split(';')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (parsed.length === 0) return;

    this.setState({
      keywords: [...keywords, ...parsed],
      inputValue: '',
    });
  };

  /**
   * Adds keywords when Enter key is pressed.
   * @param {React.KeyboardEvent<HTMLInputElement>} e
   */
  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleInputEnter();
    }
  };

  /**
   * Removes keyword by index.
   * @param {number} index
   */
  handleRemoveKeyword = (index) => {
    this.setState((prev) => ({
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  /**
   * Receives progress updates from the backend.
   * @param {number} done
   * @param {number} total
   */
  handleProgressUpdate = (done, total) => {
    const percent = Math.round((done / total) * 100);
    this.setState({ loadingProgress: percent });
  };

  /**
   * Resets keywords and search state.
   */
  resetQuery = () => {
    this.setState({
      keywords: [],
      results: [],
      inputValue: '',
      loadingProgress: 0,
      isLoading: false
    });

    this.props.onSearchResults?.([]);
  };

  /**
   * Submits the current list of keywords to the backend via the search service.
   * Updates the progress bar and result state as the search progresses.
   */
  submitQuery = async () => {
    const { keywords } = this.state;
    if (keywords.length === 0) return;

    this.setState({ isLoading: true, loadingProgress: 0 });

    try {
      const { results } = await this.searchService.submitKeywordQuery(
        keywords,
        this.handleProgressUpdate
      );

      this.setState({
        results,
        isLoading: false,
        loadingProgress: 100
      });

      this.props.onSearchResults?.(results);
    } catch (err) {
      console.error('Search Error:', err);
      this.setState({ isLoading: false, loadingProgress: 0 });
    }
  };

  /**
   * Renders the UI, including input field, keyword container, progress bar, and action buttons.
   * @returns {JSX.Element}
   */
  render() {
    const { inputValue, keywords, isLoading, loadingProgress } = this.state;

    return (
      <div className="view-container">
        <div className="view-header">Search</div>

        <div className={styles.content}>
          <input
            type="text"
            placeholder="Enter keywords separated by ;"
            value={inputValue}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleInputEnter}
          />

          <div className={styles.keyContainer}>
            {keywords.map((key, idx) => (
              <span key={idx} className={styles.key}>
                {key}
                <button onClick={() => this.handleRemoveKeyword(idx)}>×</button>
              </span>
            ))}
          </div>

        </div>
        {isLoading && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${loadingProgress}%` }}></div>
            <div className={styles.progressText}>{loadingProgress}%</div>
          </div>
        )}
        <div className={styles.buttonRow}>

          <button onClick={this.submitQuery}>Submit</button>
          <button onClick={this.resetQuery}>Reset</button>
        </div>
      </div>

    );
  }
}

export default SearchQueryView;
