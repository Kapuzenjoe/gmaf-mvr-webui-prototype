/**
 * A singleton controller class that manages synchronized playback across multiple player components.
 * Maintains a central timeline and coordinates time updates, volume, mute, and play/pause states.
 */
class TimelineController {
  /**
   * Initializes controller state and internal player registry.
   */
  constructor() {
    this.players = [];          // Registered players
    this.offsetMap = new Map();    // Map of playerId => offset in seconds
    this.isPlaying = false;     // Playback state
    this.currentTime = 0;       // Current timeline time (seconds)
    this.interval = null;       // Timer reference for updating time
    this.volume = 1;            // Current volume level
    this.isMuted = false;       // Mute state
  }

  /**
   * Adds a player to the controller if it's not already registered.
   * @param {object} player - A player object implementing `play`, `pause`, `sync`, etc.
   */
  registerPlayer(player) {
    const id = player.props?.id || player.props?.fileName || 'unknown';

    if (this.players.some(p => (p.props?.id || p.props?.fileName) === id)) {
      return;
    }

    this.players.push(player);
  }

  /**
   * Removes a player from the controller.
   * @param {object} player - The player to unregister.
   */
  unregisterPlayer(player) {
    this.players = this.players.filter(p => p !== player);
  }

  /**
   * Starts synchronized playback and timeline updates.
   */
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.players.forEach(p => p.play());

    this.interval = setInterval(() => {
      const maxDuration = this.getMaxDuration();
      if (this.currentTime >= maxDuration) {
        this.pause();
        return;
      }
      this.currentTime += 0.1;
      this.syncPlayers();
    }, 100);
  }

  /**
   * Pauses playback and stops the timeline.
   */
  pause() {
    this.isPlaying = false;
    clearInterval(this.interval);
    this.players.forEach(p => p.pause?.());
  }

  /**
   * Synchronizes all registered players with the current timeline time and their offset.
   */
  syncPlayers() {
    this.players.forEach(player => {
      const id = player.props?.id || player.props?.fileName || 'unknown';
      const offset = this.offsetMap.get(id) || 0;
      player.sync?.(this.currentTime + offset);
    });
  }


  /**
   * Sets the offset (in seconds) for a specific player by ID.
   * @param {string} playerId - Unique player identifier
   * @param {number} offsetSeconds - Offset time in seconds
   */
  setPlayerOffset(playerId, offsetSeconds) {
    this.offsetMap.set(playerId, offsetSeconds);
  }

  /**
   * Retrieves the current offset for a given player.
   * @param {string} playerId - Player identifier
   * @returns {number} - Offset in seconds (defaults to 0)
   */
  getPlayerOffset(playerId) {
    return this.offsetMap.get(playerId) || 0;
  }

  /**
   * Jumps to a specific point on the timeline and updates all players.
   * @param {number} time - Target time in seconds.
   */
  seek(time) {
    this.currentTime = time;
    this.syncPlayers();
  }

  /**
   * Stops playback, resets time, and clears all registered players.
   */
  reset() {
    this.pause();

    for (const player of this.players) {
      try {
        this.unregisterPlayer(player);
        player.pause?.();
      } catch (e) {
        console.warn('Reset error for player', player, e);
      }
    }

    this.currentTime = 0;
    this.offsetMap.clear();
  }

  /**
   * Gets the longest duration among all registered players.
   * @returns {number} Maximum duration in seconds.
   */
  getMaxDuration() {
    const durations = this.players
      .map(p => p.getDuration?.())
      .filter(v => v != null);
    return durations.length > 0 ? Math.max(...durations) : 60;
  }


  /**
   * Gets the maximum buffered point across all players.
   * @returns {number} Max buffered time in seconds.
   */
  getMaxBufferedTime() {
    const buffered = this.players
      .map(p => p.getBufferedTime?.())
      .filter(v => v != null);
    return buffered.length > 0 ? Math.max(...buffered) : 0;
  }

  /**
   * Sets the playback volume for all players.
   * @param {number} volume - Volume between 0 and 1.
   */
  setVolume(volume) {
    this.volume = volume;
    this.isMuted = volume === 0;
    this.players.forEach(p => p.setVolume?.(volume));
  }

  /**
   * Toggles mute state. Restores volume if unmuted.
   */
  toggleMute() {
    const newVolume = this.isMuted ? (this.volume || 1) : 0;
    this.setVolume(newVolume);
  }
}

// Export instance
const instance = new TimelineController();
export default instance;
