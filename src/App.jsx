import React, { Component } from 'react';

import ConnectStatusView from './views/Connect/ConnectStatusView.jsx';
import SearchQueryView from './views/Search/SearchQueryView.jsx';
import BrowseView from './views/Browse/BrowseView.jsx';
import PresentationView from './views/Presentation/PresentationView.jsx';

import './styles/layout.css';

/**
 * Root component of the application.
 * Composes the main layout including connection status, search, browsing, and presentation.
 * Manages shared state for search results and selected item.
 */
class App extends Component {
  /**
   * Initializes component state.
   * - `searchResults`: stores the results returned from the search
   * - `selectedItem`: stores the currently selected item from the results
   * 
   * @param {object} props - React props
   */
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      selectedItem: null
    };
  }

  /**
   * Callback to update the search results passed from the SearchQueryView.
   * Also resets any previously selected item.
   * 
   * @param {object[]} results - Array of search result items
   */
  handleSearchResults = (results) => {
    this.setState({ searchResults: results, selectedItem: null });
  };

  /**
   * Callback to update the currently selected item.
   * 
   * @param {object} item - The selected item from the result list
   */
  handleItemSelected = (item) => {
    this.setState({ selectedItem: item });
  };

  /**
   * Renders the main application layout with three vertical columns:
   * - Left: connection + search input
   * - Middle: result browsing
   * - Right: item presentation
   * 
   * @returns {JSX.Element}
   */
  render() {
    return (
      <div className="app-container">
        <div className="column left">
          <div className="connectContainer">
            <ConnectStatusView />
          </div>
          <div className="searchContainer">
            <SearchQueryView onSearchResults={this.handleSearchResults} />
          </div>
        </div>
        <div className="column middle">
          <BrowseView results={this.state.searchResults} onItemSelected={this.handleItemSelected} />
        </div>
        <div className="column right">
          <PresentationView item={this.state.selectedItem} />
        </div>
      </div>
    );
  }
}
export default App;