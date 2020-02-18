import { Classes } from '@blueprintjs/core';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { getQueue } from '@common/store/player/selectors';
import { autobind } from 'core-decorators';
import { debounce } from 'lodash';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import ReactList from 'react-list';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import './Queue.scss';
import QueueItem from './QueueItem';

const mapStateToProps = (state: StoreState) => {
  const { player } = state;

  return {
    playingTrackId: player.playingTrack?.id,
    playingTrack: player.playingTrack,
    currentIndex: player.currentIndex,
    upNext: player.upNext,
    items: getQueue(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      updateQueue: actions.updateQueue,
      clearUpNext: actions.clearUpNext
    },
    dispatch
  );

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = PropsFromDispatch & PropsFromState;

@autobind
class Queue extends React.PureComponent<AllProps> {
  private readonly updateQueueDebounced: () => void;
  private list = React.createRef<ReactList>();

  constructor(props: AllProps) {
    super(props);

    this.updateQueueDebounced = debounce(this.onScroll, 200);
  }

  public componentDidMount() {
    const { currentIndex, playingTrack } = this.props;

    if (playingTrack && playingTrack.id && this.list.current) {
      this.list.current.scrollTo(currentIndex);
    }
  }

  public onScroll() {
    const { updateQueue } = this.props;

    if (this.list.current) {
      updateQueue(this.list.current.getVisibleRange());
    }
  }

  public renderTrack(index: number, key: number | string) {
    const { items, currentIndex } = this.props;

    const item = items[index];

    return (
      <QueueItem
        key={key}
        index={index}
        trackData={item}
        played={index < currentIndex}
        playing={index === currentIndex}
      />
    );
  }

  public render() {
    const { items, currentIndex, upNext, clearUpNext } = this.props;

    return (
      <aside className="playQueue">
        <div className="playqueue-title d-flex align-items-center justify-content-between">
          <div>Play Queue</div>
          <div>
            {upNext.length > 0 && (
              <a
                href="javascript:void(0)"
                className="clearQueue"
                onClick={() => {
                  clearUpNext();
                }}>
                Clear
              </a>
            )}
            <a className={Classes.POPOVER_DISMISS}>
              <i className="bx bx-x" />
            </a>
          </div>
        </div>
        <div className="tracks">
          <Scrollbars
            onScroll={this.updateQueueDebounced}
            renderTrackHorizontal={() => <div />}
            renderTrackVertical={props => <div {...props} className="track-vertical" />}
            renderThumbHorizontal={() => <div />}
            renderThumbVertical={props => <div {...props} className="thumb-vertical" />}>
            <ReactList
              ref={this.list}
              pageSize={8}
              type="uniform"
              initialIndex={currentIndex}
              length={items.length}
              useTranslate3d
              itemRenderer={this.renderTrack}
            />
          </Scrollbars>
        </div>
      </aside>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, {}, StoreState>(mapStateToProps, mapDispatchToProps)(Queue);
