import React from 'react';
import TimelineController from '../../controllers/TimelineController';

/**
 * Abstract base class for synchronized CMMCO player widgets.
 * Subclasses must implement `play()`, `pause()`, and `render()`.
 */
class GMAFVisualizationCMMCOWidget extends React.Component {
  constructor(props) {
    super(props);
    if (new.target === GMAFVisualizationCMMCOWidget) {
      throw new TypeError('GMAFVisualizationCMMCOWidget is an abstract class and cannot be instantiated directly.');
    }
  }

  /**
   * Registers this player with the TimelineController after mounting.
   */
  componentDidMount() {
    TimelineController.registerPlayer(this);
  }

  /**
   * Unregisters this player from the TimelineController before unmounting.
   */
  componentWillUnmount() {
    this.pause();
    TimelineController.unregisterPlayer(this);
  }

  /**
   * Optional starts playback.
   */
  play() {
    // Optional override
  }

  /**
   * Optional pauses playback.
   */
  pause() {
    // Optional override
  }

  /**
   * Optional method to synchronize playback time.
   * @param {number} time
   */
  sync(time) {
    // Optional override
  }

  /**
   * Returns the duration of the media (default 0).
   * Subclasses should override this if duration is known.
   * @returns {number}
   */
  getDuration() {
    return 0;
  }

  /**
   * Returns the buffered time (default 0).
   * Subclasses may override if buffering is supported.
   * @returns {number}
   */
  getBufferedTime() {
    return 0;
  }

  /**
   * Sets volume for this player. Optional.
   * @param {number} volume
   */
  setVolume(volume) {
    // Optional override
  }

  /**
   * Subclasses must override this to provide UI rendering.
   * @returns {null}
   */
  render() {
    return null;
  }
}

export default GMAFVisualizationCMMCOWidget;
