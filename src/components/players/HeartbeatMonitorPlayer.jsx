import React from 'react';
import GMAFVisualizationCMMCOWidget from './GMAFVisualizationCMMCOWidget';

/**
 * A timeline-synchronized player that visualizes heart rate data from a CSV file.
 * Displays a live BPM curve and altitude readings on a canvas.
 */
class HeartbeatMonitorPlayer extends GMAFVisualizationCMMCOWidget {
  /**
   * @param {object} props - React props (expects `fileUrl` for CSV source).
   */
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      data: [],
      altitudeMap: {}, // Map time => altitude
      currentTime: 0
    };
  }

  /**
   * Lifecycle hook after mount: registers player and loads data.
   */
  componentDidMount() {
    super.componentDidMount();
    this.loadCSV(this.props.fileUrl);
  }

  /**
   * Returns the total duration of the heart rate dataset.
   * @returns {number}
   */
  getDuration() {
    const { data } = this.state;
    return data.length > 0 ? data[data.length - 1].time : 0;
  }

  /**
   * Synchronizes the canvas visualization to timeline time.
   * @param {number} time - Playback time (seconds)
   */
  sync(time) {
    this.setState({ currentTime: time }, this.draw);
  }

  /**
   * Loads heart rate + altitude CSV and parses it into normalized data.
   * @param {string} url - Remote CSV file URL
   */
  async loadCSV(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) return;

      const parsed = lines.slice(1).map(line => {
        const [ts, alt, bpm] = line.split(',').map(val => val.replace(/"/g, ''));
        return {
          time: parseInt(ts, 10),
          bpm: parseFloat(bpm),
          altitude: parseFloat(alt)
        };
      });

      const offset = parsed[0].time;
      const normalized = parsed.map(d => ({
        time: d.time - offset,
        bpm: d.bpm,
        altitude: d.altitude
      }));

      const altitudeMap = {};
      for (const d of normalized) {
        altitudeMap[d.time] = d.altitude;
      }

      this.setState({ data: normalized, altitudeMap }, this.draw);
    } catch (err) {
      console.error('CSV load error:', err);
    }
  }

  /**
   * Draws the heart rate chart and annotations on canvas.
   */
  draw = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { data, currentTime, altitudeMap } = this.state;
    if (data.length < 2) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxTime = data[data.length - 1].time;
    const scaleX = canvas.width / maxTime;
    const scaleY = canvas.height / 200; // Assuming max 200 bpm

    const visible = data.filter(d => d.time <= currentTime);

    // Draw BPM curve
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;

    visible.forEach((point, i) => {
      const x = point.time * scaleX;
      const y = canvas.height - point.bpm * scaleY;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw axis labels and values
    const last = visible[visible.length - 1];
    const roundedTime = Math.round(currentTime);
    const altitude = altitudeMap[roundedTime];

    ctx.fillStyle = '#ccc';
    ctx.font = '12px Arial';
    ctx.fillText(`200 bpm`, 5, 10);
    ctx.fillText(`0`, 5, canvas.height - 5);
    ctx.fillText(`0s`, 30, canvas.height - 5);
    ctx.fillText(`${roundedTime}s`, canvas.width - 40, canvas.height - 5);

    if (altitude !== undefined) {
      ctx.fillText(`${altitude.toFixed(1)} m`, canvas.width - 75, 20);
    }

    if (last) {
      ctx.fillText(`bpm: ${last.bpm.toFixed(0)}`, canvas.width - 75, 35);
    }

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let bpm = 50; bpm <= 200; bpm += 50) {
      const y = canvas.height - bpm * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      ctx.fillStyle = '#888';
      ctx.font = '10px Arial';
      ctx.fillText(`${bpm} bpm`, 5, y - 2);
    }

    ctx.setLineDash([]);
  };

  /**
   * Renders the canvas and BPM label.
   * @returns {JSX.Element}
   */
  render() {
    return (
      <div>
        <canvas
          ref={this.canvasRef}
          width={400}
          height={100}
          style={{
            backgroundColor: '#111',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        <div style={{ color: '#ccc', textAlign: 'center' }}>
          heart rate (bpm)
        </div>
      </div>
    );
  }
}

export default HeartbeatMonitorPlayer;
