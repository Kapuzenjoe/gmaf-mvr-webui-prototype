import JSZip from 'jszip';
import { guessMimeType } from '../utils/MimeTypeHelper';

/**
 * Service for extracting and mapping files from CMMCO(zip) archives.
 */
class CMMCOunzipService {
  /**
   * Extracts all visible files from a CMMCO(zip) and returns media items with blob URLs.
   * Ignores hidden files and macOS metadata folders.
   * @param {string} zipUrl - URL to the .zip file
   * @param {Array} references - unused for now, reserved for future mapping
   * @param {string} mmcoType - optional MMCO type to assign
   * @returns {Promise<Array>} - List of mediaItems
   */
  static async extractMediaItemsFromCMMCO(zipUrl, mmcoType = 'default') {
    try {
      const response = await fetch(zipUrl);
      const blob = await response.blob();
      const zip = await JSZip.loadAsync(blob);

      const mediaItems = [];

      const isHidden = (path) =>
        path.startsWith('__MACOSX/') ||
        path.startsWith('.') ||
        path.includes('/.') ||
        path.endsWith('/');

      for (const [path, zipEntry] of Object.entries(zip.files)) { 
        if (zipEntry.dir || isHidden(path)) continue;

        const fileBlob = await zipEntry.async('blob');
        const objectURL = URL.createObjectURL(fileBlob);

        const fileName = path.split('/').pop();
        const fallbackMime = guessMimeType(fileName);
        const mimeType = fileBlob.type || fallbackMime;

        mediaItems.push({
          id: fileName,
          mimeType,
          mmcoType,
          fileUrl: objectURL,
          fileName
        });
      }

      return mediaItems;
    } catch (error) {
      console.error('CMMCOunzipService.extractMediaItemsFromZip failed:', error);
      return [];
    }
  }
}

export default CMMCOunzipService;