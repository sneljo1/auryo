import { PlayerStatus, RepeatTypes } from '@common/store/player';
import cn from 'classnames';
import React from 'react';
import * as styles from './PlayerControls.module.scss';

interface Props {
  repeat: RepeatTypes | null;
  shuffle: boolean;
  status: PlayerStatus;

  onRepeatClick(): void;
  onShuffleClick(): void;
  onPreviousClick(): void;
  onNextClick(): void;
  onToggleClick(): void;
}

const getIcon = (status: PlayerStatus) => (status === PlayerStatus.PLAYING ? 'pause' : 'play');

const PlayerControls = React.memo<Props>(
  ({ status, repeat, shuffle, onRepeatClick, onPreviousClick, onToggleClick, onNextClick, onShuffleClick }) => {
    return (
      <>
        <a
          href="javascript:void(0)"
          className={cn(styles.control, { [styles.control__active]: repeat !== null })}
          onClick={onRepeatClick}>
          <i className={cn('bx bx-repost', { [styles.repost_icon__one]: repeat === RepeatTypes.ONE })} />
        </a>

        <div className={cn('d-flex align-items-center', styles.mediaControls)}>
          <a className={styles.control} href="javascript:void(0)" onClick={onPreviousClick}>
            <i className="bx bx-skip-previous" />
          </a>
          <a
            className={cn(styles.control, styles.control_toggle)}
            href="javascript:void(0)"
            onClick={() => {
              onToggleClick();
            }}>
            <i className={`bx bx-${getIcon(status)}`} />
          </a>
          <a className={styles.control} href="javascript:void(0)" onClick={onNextClick}>
            <i className="bx bx-skip-next" />
          </a>
        </div>

        <a
          href="javascript:void(0)"
          className={cn(styles.control, styles.control_shuffle, { [styles.control__active]: shuffle })}
          onClick={onShuffleClick}>
          <i className="bx bx-shuffle" />
        </a>
      </>
    );
  }
);

export default PlayerControls;
