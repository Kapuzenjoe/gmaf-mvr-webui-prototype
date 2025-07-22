import React from 'react';
import GMAFVisualizationCMMCOWidget from './GMAFVisualizationCMMCOWidget';

/**
 * ImagePlayer displays a static image file using the provided file URL.
 * It extends the base GMAFVisualizationCMMCOWidget class for timeline support.
 */
class ImagePlayer extends GMAFVisualizationCMMCOWidget {
  /**
   * Renders the image using the provided `fileUrl` and `fileName` props.
   * @returns {JSX.Element}
   */
  render() {
    const { fileUrl, fileName } = this.props;

    return (
      <div className="image-player-container" style={{ width: '100%', height: '100%' }}>
        <img
          src={fileUrl}
          alt={fileName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>
    );
  }
}

export default ImagePlayer;
