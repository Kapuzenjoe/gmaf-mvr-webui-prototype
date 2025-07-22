import React, { Component } from 'react';
import TimelineController from '../controllers/TimelineController';
import { FaPlay, FaPause, FaUndo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import styles from './TimelineSeekBar.module.css';

/**
 * A synchronized timeline UI component for controlling playback,
 * seeking, and volume across all registered media players.
 * Coordinates with the global TimelineController.
 */
class TimelineSeekBar extends Component {
  /**
   * Initializes component state for position, duration, buffer, and volume.
   * @param {object} props - React component props.
   */
  constructor(props) {
    super(props);
    this.state = {
      position: 0,        // Current time position in seconds
      duration: 0,        // Maximum duration across all players
      buffered: 0,        // Max buffered time
      isMuted: false,     // Mute status
      volume: 1,          // Volume level (0-1)
      showVolume: false   // Visibility of volume slider
    };
    this.volumeTimeout = null;
  }

  /**
   * Starts polling the playback state from TimelineController after mounting.
   */
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({
        position: TimelineController.currentTime,
        duration: TimelineController.getMaxDuration?.() || 0,
        buffered: TimelineController.getMaxBufferedTime?.() || 0
      });
    }, 100);
  }

  /**
   * Clears polling interval when component unmounts.
   */
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  /**
   * Handles seek bar click and moves the timeline to the clicked position.
   * @param {React.MouseEvent} e - Mouse click event.
   */
  handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * this.state.duration;
    TimelineController.seek(newTime);
    this.setState({ position: newTime });
  };

  /**
   * Toggles the mute state and updates volume in TimelineController.
   */
  toggleMute = () => {
    const { isMuted } = this.state;
    const newVolume = isMuted ? (TimelineController.volume || 1) : 0;
    this.setState({
      isMuted: !isMuted,
      volume: newVolume
    });
    TimelineController.setVolume(newVolume);
  };

  /**
   * Updates the volume level based on user input.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Volume slider change event.
   */
  handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    this.setState({ volume: v, isMuted: v === 0 });
    TimelineController.setVolume(v);
  };

  /**
   * Shows or hides the volume slider based on mouse hover.
   * @param {boolean} hovering - Whether the user is hovering the volume control.
   */
  handleVolumeHover = (hovering) => {
    clearTimeout(this.volumeTimeout);
    if (hovering) {
      this.setState({ showVolume: true });
    } else {
      this.volumeTimeout = setTimeout(() => {
        this.setState({ showVolume: false });
      }, 800);
    }
  };

  /**
   * Renders the timeline seekbar, control buttons, and volume UI.
   * @returns {JSX.Element} The rendered timeline component.
   */
  render() {
    const { position, duration, buffered, isMuted, volume, showVolume } = this.state;

    return (
      <div className={styles.controllerWrapper}>
        <div className={styles.seekbarWrapper} onClick={this.handleSeekClick}>
          <div className={styles.seekbarBackground}>
            <div
              className={styles.seekbarBuffered}
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            <div
              className={styles.seekbarPlayed}
              style={{ width: `${(position / duration) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.controlsLeft}>
            <button onClick={() => TimelineController.play()}><FaPlay /></button>
            <button onClick={() => TimelineController.pause()}><FaPause /></button>
            <button onClick={() => {
              TimelineController.pause();
              TimelineController.seek(0);
            }}><FaUndo /></button>

            <div
              className={styles.volumeControl}
              onMouseEnter={() => this.handleVolumeHover(true)}
              onMouseLeave={() => this.handleVolumeHover(false)}
            >
              <button onClick={this.toggleMute} className={styles.volumeButton}>
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              {showVolume && (
                <div className={styles.volumeSliderWrapper}>
                  <div className={styles.volumeSliderRotated}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={this.handleVolumeChange}
                      className={styles.volumeSlider}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.timeDisplay}>
            {position.toFixed(1)} / {duration.toFixed(1)} s
          </div>
        </div>
      </div>
    );
  }
}

export default TimelineSeekBar;
