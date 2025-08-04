import React, { useMemo } from 'react';
import { Rnd } from 'react-rnd';
import styles from './PlayerWrapper.module.css';

/**
 * A visual wrapper component for media players.
 * Wraps each player with a label and optional draggable/resizable container in modal mode.
 *
 * @param {React.ReactNode} children - The media player component
 * @param {boolean} isModal - Whether modal mode is active
 * @param {string} fileName - Optional title shown above the player
 * @param {number} index - Index used for default grid layout
 * @param {object} boundsRef - Ref to DOM element used for movement boundaries
 * @returns {JSX.Element}
 */
const PlayerWrapper = ({ children, isModal = false, fileName, index = 0, boundsRef }) => {
  const HEADER_HEIGHT = 120;
  const ITEM_WIDTH = 420;
  const ITEM_HEIGHT = 300;
  const SPACING_X = 20;
  const SPACING_Y = 20;
  const COLUMNS = 2;

  // Calculate initial position in modal grid
  const position = useMemo(() => {
    if (!isModal) return null;

    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    return {
      x: col * (ITEM_WIDTH + SPACING_X),
      y: HEADER_HEIGHT + row * (ITEM_HEIGHT + SPACING_Y),
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT
    };
  }, [index, isModal]);

  // Standard content layout with optional title
  const content = (
    <div className={styles.playerWrapper} data-testid="player-wrapper">
      {fileName && <div className={styles.playerTitle}>{fileName}</div>}
      <div className={styles.playerInner}>{children}</div>
    </div>
  );

  // Embedded mode → no RND, just responsive layout
  if (!isModal || !position) return content;

  // Modal mode → enable drag & resize
  return (
    <Rnd
      bounds={boundsRef?.current || undefined}
      default={position}
      minWidth={350}
      minHeight={180}
      className={styles.rndWrapper}
      dragGrid={[20, 20]}
      resizeGrid={[20, 20]}
    >
      {content}
    </Rnd>
  );
};

export default PlayerWrapper;
