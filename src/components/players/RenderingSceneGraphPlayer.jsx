import React from 'react';
import GMAFVisualizationCMMCOWidget from './GMAFVisualizationCMMCOWidget';

/**
 * SceneGraphViewer synchronizes and displays Scene Graph logs (.txt) with a timeline.
 * Each snapshot block is parsed into a list of nodes for real-time inspection.
 */
class SceneGraphViewer extends GMAFVisualizationCMMCOWidget {
  constructor(props) {
    super(props);
    this.state = {
      snapshots: [],        // List of snapshot blocks: { time: number, nodes: [...] }
      currentTime: 0        // Current playback time in seconds
    };
    this.timer = null;
    this.startTime = null;
  }

  componentDidMount() {
    super.componentDidMount();
    this.loadTxt(this.props.fileUrl);
  }

  /**
   * Loads and parses a .txt scene graph file into time-aligned snapshot blocks.
   * @param {string} url - File URL
   */
  async loadTxt(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.trim().split('\n');

      const snapshots = [];
      let currentBlock = [];
      let baseTime = null;

      for (let line of lines) {
        if (line.includes('--- Start Scene Graph ---')) {
          currentBlock = [];
          continue;
        }

        if (line.includes('--- End Scene Graph ---')) {
          if (currentBlock.length > 0) {
            const blockTime = currentBlock[0].time;
            snapshots.push({ time: blockTime, nodes: currentBlock });
          }
          currentBlock = [];
          continue;
        }

        const timeMatch = line.match(/^(\d{2}:\d{2}:\d{2}\.\d{3})/);
        const jsonMatch = line.match(/\{.*\}/);

        if (timeMatch && jsonMatch) {
          try {
            const timestamp = this.parseTime(timeMatch[1]);
            if (!baseTime) baseTime = timestamp;
            const timeSec = (timestamp - baseTime) / 1000;

            const rawJson = jsonMatch[0].trim().replace(/,\s*}/g, '}');
            const node = JSON.parse(rawJson);

            if (!node.name || node.state == null || node.depth == null) continue;

            node.time = timeSec;
            node.state = parseInt(node.state, 10);
            node.depth = parseInt(node.depth, 10);

            currentBlock.push(node);
          } catch (err) {
            continue;
          }
        }
      }

      this.setState({ snapshots });
    } catch (err) {
      console.error('Failed to load scene graph file:', err);
    }
  }

  /**
   * Converts a timestamp string (HH:mm:ss.SSS) to a Date instance.
   * @param {string} ts - Timestamp string
   * @returns {Date}
   */
  parseTime(ts) {
    const [h, m, s] = ts.split(':');
    const [sec, ms] = s.split('.');
    const date = new Date();
    date.setHours(+h, +m, +sec, +ms);
    return date;
  }

  /**
   * Called by TimelineController to sync playback time.
   * @param {number} time - Playback time in seconds
   */
  sync(time) {
    this.setState({ currentTime: time });
  }

  /**
   * Returns the total duration of the loaded snapshots.
   * @returns {number}
   */
  getDuration() {
    const { snapshots } = this.state;
    return snapshots.length ? Math.max(...snapshots.map(s => s.time)) : 0;
  }

  /**
   * Renders additional transformation details for a node.
   * @param {object} node
   * @returns {JSX.Element}
   */
  renderNodeParameters(node) {
    return (
      <>
        <div className="node-param">Position (t_x: {node.t_x}, t_y: {node.t_y}, t_z: {node.t_z})</div>
        <div className="node-param">Scale (s_x: {node.s_x}, s_y: {node.s_y}, s_z: {node.s_z})</div>
        <div className="node-param">Rotation (r_x: {node.r_x}, r_y: {node.r_y}, r_z: {node.r_z}, r_w: {node.r_w})</div>
        <div className="node-param">Bounding Box Center (b_c_x: {node.b_c_x}, b_c_y: {node.b_c_y}, b_c_z: {node.b_c_z})</div>
        <div className="node-param">Bounding Box Size (b_s_x: {node.b_s_x}, b_s_y: {node.b_s_y}, b_s_z: {node.b_s_z})</div>
      </>
    );
  }

  /**
   * Renders the active snapshot node tree at the current timeline position.
   * @returns {JSX.Element}
   */
  render() {
    const { snapshots, currentTime } = this.state;

    const snapshot = [...snapshots].reverse().find(s => s.time <= currentTime);
    const activeNodes = snapshot?.nodes.filter(n => n.state === 1) || [];

    return (
      <div className="scenegraph-viewer" style={{ fontFamily: 'monospace', color: '#ccc' }}>
        <div style={{ marginBottom: '0.5em' }}>
          [{currentTime.toFixed(2)}s]
        </div>
        {activeNodes.map((node, i) => (
          <div
            key={i}
            style={{ marginLeft: `${node.depth * 20}px`, marginBottom: '0.25em' }}
          >
            <div className="node-name">{(node.depth > 0 ? '└── ' : '') + node.name}</div>
            {this.renderNodeParameters(node)}
          </div>
        ))}
      </div>
    );
  }
}
export default SceneGraphViewer;
