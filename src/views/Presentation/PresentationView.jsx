import React, { Component } from 'react';
import { FaExpand } from 'react-icons/fa';
import styles from './PresentationView.module.css';

import PlayerWrapper from '../../components/PlayerWrapper';
import { getPlayer } from '../../components/PlayerRegistry';
import TimelineSeekBar from '../../components/TimelineSeekBar.jsx';

import TimelineController from '../../controllers/TimelineController';
import CMMCOunzipService from '../../service/CMMCOunzipService';

/**
 * View for presenting synchronized media content of a selected item.
 * Supports embedded and modal views with timeline control.
 */
class PresentationView extends Component {
  /**
   * @param {object} props - React props
   */
  constructor(props) {
    super(props);
    this.state = {
      mediaItems: [],
      showPlayerModal: false,
      visiblePlayers: {},
    };
    this.modalRef = React.createRef();
  }

  /** Opens modal player view */
  openPlayerModal = () => {
    TimelineController.pause();
    TimelineController.seek(0);
    this.setState({ showPlayerModal: true });
  };

  /** Closes modal player view */
  closePlayerModal = () => this.setState({ showPlayerModal: false });

  /**
   * React lifecycle: update players when item changes
   * @param {object} prevProps
   */
  componentDidUpdate(prevProps) {
    if (prevProps.item !== this.props.item && this.props.item) {
      TimelineController.reset();
      this.initializePlayersFromItem(this.props.item);
    }
  }

  /**
   * Loads main and referenced media items.
   * @param {object} item
   */
  async initializePlayersFromItem(item) {
    const mediaItems = [];

    if (item?.fileUrl && item?.mimeType !== 'application/zip') {
      mediaItems.push({
        id: item.generalMetadata?.id || 'main',
        fileName: item.generalMetadata?.fileName || '',
        mimeType: item.mimeType,
        mmcoType: item.mmcoType,
        fileUrl: item.fileUrl,
      });
    }

    if (item?.fileUrl && item.mimeType === 'application/zip') {
      const extracted = await CMMCOunzipService.extractMediaItemsFromCMMCO(
        item.fileUrl,
        item.mmcoType
      );
      mediaItems.push(...extracted);
    }

    this.setState({
      mediaItems,
      visiblePlayers: Object.fromEntries(mediaItems.map(m => [m.id, true]))
    });
  }

  /**
   * Sorts media by priority: videos first
   * @param {Array} mediaItems
   * @returns {Array}
   */
  sortMediaItems(mediaItems) {
    return [...mediaItems].sort((a, b) =>
      /^video\//.test(b.mimeType) - /^video\//.test(a.mimeType)
    );
  }

  /**
   * Renders metadata and reference list.
   * @returns {JSX.Element}
   */
  renderMetadata() {
    const { generalMetadata = {}, mimeType, mmcoType } = this.props.item || {};
    const { mediaItems} = this.state;

    return (
      <div>
        <strong>Metadata:</strong>
        <div className={styles.metadata}>
          <p><strong>ID:</strong> {generalMetadata.id}</p>
          <p><strong>Dateiname:</strong> {generalMetadata.fileName}</p>
          <p><strong>MIME Type:</strong> {mimeType}</p>
          <p><strong>MMCO Type:</strong> {mmcoType}</p>
          <p><strong>Dateipfad:</strong> {generalMetadata.fileReference}</p>

          {mimeType === 'application/zip' && (
            <>
              <p><strong>CMMCO:</strong></p>
              <ul>
                {mediaItems.map((ref, i) => (
                  <li key={i}>{ref.fileName} – <em>{ref.mimeType}</em></li>
                ))}
              </ul>
            </>
          )} 
        </div>
      </div>
    );
  }

  /**
   * Renders player components for active media.
   * @param {Array} mediaItems
   * @returns {React.Element[]}
   */
  renderAllPlayers(mediaItems) {
    const { visiblePlayers, showPlayerModal } = this.state;
    return this.sortMediaItems(mediaItems)
      .filter(media => visiblePlayers[media.id])
      .map((media, index) => {
        const Player = getPlayer(media.mimeType, media.mmcoType);
        if (!Player) return null;

        return (
          <PlayerWrapper
            key={media.id}
            fileName={media.fileName}
            isModal={showPlayerModal}
            index={index}
            boundsRef={this.modalRef}
          >
            <Player id={media.id} fileUrl={media.fileUrl} fileName={media.fileName} />
          </PlayerWrapper>
        );
      });
  }

  /**
   * Renders the embedded (inline) player view.
   * @returns {JSX.Element}
   */
  renderEmbeddedPlayers() {
    const { mediaItems, showPlayerModal } = this.state;
    if (showPlayerModal) return null;

    return (
      <div className={styles.embeddedContent}>
        <button onClick={this.openPlayerModal} title="Expand Player Area">
          <FaExpand /> PopOut Players
        </button>
        <div className={styles.embeddedPlayers}>
          {this.renderAllPlayers(mediaItems)}
        </div>
      </div>
    );
  }

  /**
   * Renders players inside a modal overlay with timeline controls.
   * @returns {JSX.Element}
   */
  renderModalPlayers() {
    const { mediaItems, visiblePlayers } = this.state;
    const sorted = this.sortMediaItems(mediaItems).filter(m => visiblePlayers[m.id]);

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} ref={this.modalRef}>
          <button className={styles.closeButton} onClick={this.closePlayerModal}>×</button>
          {this.renderAllPlayers(sorted)}
          <TimelineSeekBar />
        </div>
      </div>
    );
  }

  renderPlayerVisibilityControls() {
    const { mediaItems, visiblePlayers } = this.state;

    return (
      <div className={styles.visibilityControls}>
        <strong>Players:</strong>
        <table className={styles.playerTable}>
          <thead>
            <tr>
              <th>Active</th>
              <th>Filename</th>
              <th>MIME-Type</th>
              <th>Offset (s)</th>
            </tr>
          </thead>
          <tbody>
            {mediaItems.map(media => (
              <tr key={media.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={visiblePlayers[media.id]}
                    onChange={() =>
                      this.setState(prev => ({
                        visiblePlayers: {
                          ...prev.visiblePlayers,
                          [media.id]: !prev.visiblePlayers[media.id]
                        }
                      }))
                    }
                  />
                </td>
                <td className={styles.fileNameCell}>
                  {media.fileName || media.id}
                </td>
                <td>
                  {media.mimeType}
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={0}
                    className={styles.offsetInput}
                    placeholder="Offset"
                    onChange={(e) => {
                      const seconds = parseFloat(e.target.value);
                      if (!isNaN(seconds)) {
                        TimelineController.setPlayerOffset(media.id, seconds);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }


  /**
   * Main render function for the component.
   * @returns {JSX.Element}
   */
  render() {
    const { item } = this.props;

    return (
      <div className="view-container">
        <div className="view-header">Presentation</div>
        {!item ? (
          <div className={styles.placeholder}>No item selected.</div>
        ) : (
          <div className={styles.content}>
            {this.renderMetadata()}
            {this.renderPlayerVisibilityControls()}
            {this.renderEmbeddedPlayers()}
            <TimelineSeekBar />
            {this.state.showPlayerModal && this.renderModalPlayers()}
          </div>
        )}
      </div>
    );
  }
}

export default PresentationView;