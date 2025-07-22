import React, { Component } from 'react';
import styles from './BrowseView.module.css';
import {
  FaVideo,
  FaFile,
  FaSortAlphaDown,
  FaSortAlphaUpAlt,
  FaSortAmountDown,
  FaBox
} from 'react-icons/fa';

/**
 * BrowseView lists available media items with filter/sort controls and previews.
 * Allows selecting items to display in a detailed view.
 */
class BrowseView extends Component {
  /**
   * @param {object} props - Component props
   */
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
      sortMode: 'mmfg',
      filterMimeType: 'all'
    };
  }

  /**
   * Handles filter text input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  handleFilterChange = (e) => {
    this.setState({ filterText: e.target.value });
  };

  /**
   * Updates sorting mode.
   * @param {'mmfg' | 'az' | 'za'} mode
   */
  handleSortChange = (mode) => {
    this.setState({ sortMode: mode });
  };

  /**
   * Emits selected item to parent component.
   * @param {object} item
   */
  handleItemClick = (item) => {
    this.props.onItemSelected?.(item);
  };

  /**
   * Filters and sorts the results.
   * @returns {object[]} filtered and sorted list
   */
  getFilteredAndSortedResults() {
    const { results = [] } = this.props;
    const { filterText, sortMode, filterMimeType } = this.state;

    let filtered = results.filter(item => {
      if (!item || typeof item !== 'object') return false;

      const name = item.generalMetadata?.fileName || '';
      const mime = item.mimeType || '';

      const matchesText = name.toLowerCase().includes(filterText.toLowerCase());
      const matchesMime =
        filterMimeType === 'all' ||
        mime.startsWith(filterMimeType) ||
        mime === filterMimeType;

      return matchesText && matchesMime;
    });

    if (sortMode === 'az') {
      filtered.sort((a, b) =>
        (a.generalMetadata?.fileName || '').localeCompare(b.generalMetadata?.fileName || '')
      );
    } else if (sortMode === 'za') {
      filtered.sort((a, b) =>
        (b.generalMetadata?.fileName || '').localeCompare(a.generalMetadata?.fileName || '')
      );
    }

    return filtered;
  }

  /**
   * Renders file preview based on file type.
   * @param {string} fileRef
   * @param {string} preview
   * @param {string} fileName
   * @returns {JSX.Element}
   */
  renderPreview(fileRef, preview, fileName) {
    if (/\.(jpe?g|png)$/i.test(fileRef)) {
      return <img src={preview} alt={fileName} className={styles.previewImage} />;
    } else if (/\.(mp4|mov|avi)$/i.test(fileRef)) {
      return <div className={styles.iconPlaceholder}><FaVideo size={48} /></div>;
    } else if (/\.cmmco$/i.test(fileRef)) {
      return <div className={styles.iconPlaceholder}><FaBox size={48} /></div>;
    } else {
      return <div className={styles.iconPlaceholder}><FaFile size={48} /></div>;
    }
  }

  /**
   * Main render function.
   * @returns {JSX.Element}
   */
  render() {
    const { filterText, sortMode, filterMimeType } = this.state;
    const results = this.getFilteredAndSortedResults();
    const validResults = results.filter(
      (item) =>
        item &&
        (item.generalMetadata?.fileName || item.fileUrl || item.mimeType)
    );
    const totalCount = validResults.length;


    return (
      <div className="view-container">
        <div className="view-header">Browse Results</div>

        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filterText}
            onChange={this.handleFilterChange}
          />

          <select
            value={filterMimeType}
            onChange={(e) => this.setState({ filterMimeType: e.target.value })}
            className={styles.mimeFilterSelect}
          >
            <option value="all">All</option>
            <option value="video/">Video</option>
            <option value="audio/">Audio</option>
            <option value="image/">Image</option>
            <option value="text/csv">Heart rate data (csv)</option>
            <option value="text/plain">Render Scene Graph (txt)</option>
            <option value="application/pdf">PDF</option>
            <option value="application/zip">CMMCO</option>
          </select>

          <div className={styles.sortButtons}>
            <button
              onClick={() => this.handleSortChange('mmfg')}
              className={sortMode === 'mmfg' ? styles.activeSort : ''}
            >
              <FaSortAmountDown />
            </button>
            <button
              onClick={() => this.handleSortChange('az')}
              className={sortMode === 'az' ? styles.activeSort : ''}
            >
              <FaSortAlphaDown />
            </button>
            <button
              onClick={() => this.handleSortChange('za')}
              className={sortMode === 'za' ? styles.activeSort : ''}
            >
              <FaSortAlphaUpAlt />
            </button>
          </div>

          <div className={styles.countDisplay}>
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </div>
        </div>

        <div className={styles.gallery}>
          {totalCount === 0 ? (
            <div>No results</div>
          ) : (
            validResults.map((item, index) => {
              const metadata = item.generalMetadata || {};
              const fileName = metadata.fileName || 'Unknown';
              const fileRef = metadata.fileReference || '';
              const preview = item.fileUrl || fileRef;

              return (
                <div
                  key={item.generalMetadata?.id || item.fileUrl || index}
                  className={styles.card}
                  onClick={() => this.handleItemClick(item)}
                >
                  {this.renderPreview(fileRef, preview, fileName)}
                  <div className={styles.fileName}>{fileName}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
}

export default BrowseView;
