/**
 * Utility for guessing MIME types based on file extension.
 * Used as a fallback when the server or blob does not provide a type.
 */
const extensionToMimeMap = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  pdf: 'application/pdf',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  zip: 'application/zip',
  cmmco: 'application/zip'
};

/**
 * Determines the MIME type from a given file name.
 * Falls back to 'application/octet-stream' if unknown.
 * 
 * @param {string} fileName - The file name or path (e.g. 'video.mp4')
 * @returns {string} MIME type string
 */
export function guessMimeType(fileName) {
  if (!fileName || typeof fileName !== 'string') return 'application/octet-stream';

  const parts = fileName.split('.');
  const ext = parts.pop().toLowerCase();

  return extensionToMimeMap[ext] || 'application/octet-stream';
}
