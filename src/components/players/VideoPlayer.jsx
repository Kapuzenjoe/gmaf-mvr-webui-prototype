import React from 'react';
import GMAFVisualizationCMMCOWidget from './GMAFVisualizationCMMCOWidget';

/**
 * A player component for rendering and controlling video playback.
 * Integrates with the global TimelineController for synchronized timelines.
 */
class VideoPlayer extends GMAFVisualizationCMMCOWidget {
  /**
   * Initializes the component and creates a reference to the video element.
   * @param {object} props - Component props including fileUrl.
   */
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
  }

  /**
   * Starts video playback if ready.
   */
  play() {
    const video = this.videoRef.current;
    if (video && video.readyState >= 3) {
      video.play().catch(err => {
        console.warn('Video play failed:', err.message);
      });
    }
  }

  /**
   * Pauses the video if playing.
   */
  pause() {
    const video = this.videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
  }

  /**
   * Synchronizes the playback to a given time (in seconds).
   * @param {number} time - Target time in seconds.
   */
  sync(time) {
    const video = this.videoRef.current;
    if (!video) return;

    const diff = Math.abs(video.currentTime - time);
    if (diff > 0.5 && !video.seeking && !video.paused) {
      video.currentTime = time;
    }
  }

  /**
   * Returns the duration of the video in seconds.
   * @returns {number}
   */
  getDuration() {
    return this.videoRef.current?.duration || 0;
  }

  /**
   * Returns the highest buffered time based on current playback position.
   * @returns {number}
   */
  getBufferedTime() {
    const video = this.videoRef.current;
    if (!video || !video.buffered) return 0;

    const current = video.currentTime;
    for (let i = 0; i < video.buffered.length; i++) {
      if (current >= video.buffered.start(i) && current <= video.buffered.end(i)) {
        return video.buffered.end(i);
      }
    }
    return 0;
  }

  /**
   * Sets the playback volume and mute state.
   * @param {number} volume - Value between 0 (mute) and 1 (max).
   */
  setVolume(volume) {
    const video = this.videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
    }
  }

  /**
   * Renders the video element using the given fileUrl prop.
   * @returns {JSX.Element}
   */
  render() {
    const { fileUrl } = this.props;

    return (
      <div className="video-player-container" style={{ width: '100%', height: '100%' }}>
        <video
          ref={this.videoRef}
          src={fileUrl}
          controls={false}
          preload="auto"
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
}

export default VideoPlayer;
