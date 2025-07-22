import VideoPlayer from './players/VideoPlayer';
import AudioPlayer from './players/AudioPlayer';
import ImagePlayer from './players/ImagePlayer';
import HeartbeatMonitorPlayer from './players/HeartbeatMonitorPlayer';
import RenderingSceneGraphPlayer from './players/RenderingSceneGraphPlayer';

/**
 * A registry that maps MIME types and mmcoTypes to their corresponding GVCW (player component).
 *
 * Both the MIME type pattern and the mmcoType string must match for the player to be selected.
 */
const playerRegistry = [
  { mimePattern: /^video\//, mmcoType: 'default', gvcw: VideoPlayer },
  { mimePattern: /^audio\//, mmcoType: 'default', gvcw: AudioPlayer },
  { mimePattern: /^image\//, mmcoType: 'default', gvcw: ImagePlayer },
  { mimePattern: /text\/csv$/, mmcoType: 'default', gvcw: HeartbeatMonitorPlayer },
  { mimePattern: /text\/plain$/, mmcoType: 'default', gvcw: RenderingSceneGraphPlayer },
  // Add more mappings here
];

/**
 * Returns a React component (GVCW) based on both MIME type and mmcoType.
 *
 * @param {string} mimeType - The MIME type of the file (e.g., "video/mp4").
 * @param {string} mmcoType - The type descriptor from CMMCO metadata (e.g., "heartbeat").
 * @returns {React.Component|null} - The matching player component, or null if none matches.
 */
export function getPlayer(mimeType, mmcoType) {
  for (const { mimePattern, mmcoType: expectedType, gvcw } of playerRegistry) {
    if (mimePattern.test(mimeType) && mmcoType === expectedType) {
      return gvcw;
    }
  }
  return null;
}
