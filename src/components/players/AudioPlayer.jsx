import React from 'react';
import { FaMusic } from 'react-icons/fa';
import GMAFVisualizationCMMCOWidget from './GMAFVisualizationCMMCOWidget';

/**
 * A minimal audio player component that integrates with the global TimelineController.
 * Inherits from GMAFVisualizationCMMCOWidget for synchronization support.
 */
class AudioPlayer extends GMAFVisualizationCMMCOWidget {
  /**
   * Initializes the component with a reference to the audio element.
   * @param {object} props - React props including fileUrl and fileName.
   */
  constructor(props) {
    super(props);
    this.audioRef = React.createRef();
  }

  /**
   * Starts audio playback if ready.
   */
  play() {
    const audio = this.audioRef.current;
    if (audio && audio.readyState >= 2) {
      audio.play().catch(err => {
        console.warn('Audio play failed:', err.message);
      });
    }
  }

  /**
   * Pauses the audio playback if active.
   */
  pause() {
    const audio = this.audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  /**
   * Synchronizes audio playback to the target time.
   * @param {number} time - Target playback time in seconds.
   */
  sync(time) {
    const audio = this.audioRef.current;
    if (!audio) return;

    const diff = Math.abs(audio.currentTime - time);
    if (diff > 0.5 && !audio.seeking && !audio.paused) {
      audio.currentTime = time;
    }
  }

  /**
   * Returns the audio duration in seconds.
   * @returns {number}
   */
  getDuration() {
    return this.audioRef.current?.duration || 0;
  }

  /**
   * Sets the audio playback volume.
   * @param {number} volume - Value from 0 (mute) to 1 (max).
   */
  setVolume(volume) {
    const audio = this.audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = volume === 0;
    }
  }

  /**
   * Renders the player UI and underlying audio element.
   * @returns {JSX.Element}
   */
  render() {
    const { fileUrl, fileName } = this.props;

    return (
      <div
        className="audio-player"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          fontFamily: 'monospace',
          color: '#eee',
        }}
      >
        <FaMusic size={20} />
        <span>{fileName || 'Audio file'}</span>
        <audio
          ref={this.audioRef}
          src={fileUrl}
          preload="auto"
          style={{ display: 'none' }}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
}

export default AudioPlayer;
