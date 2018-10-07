import cn from 'classnames';
import { debounce } from 'lodash';
import * as React from 'react';
import * as ReactList from 'react-list';
import { PlayerState, playTrack, updateQueue } from '../../../../../common/store/player';
import { toggleQueue } from '../../../../../common/store/ui';
import { getCurrentPosition } from '../../../../../common/utils/playerUtils';
import CustomScroll from '../../../_shared/CustomScroll';
import Spinner from '../../../_shared/Spinner/Spinner';
import QueueItem from './QueueItem';
import { SoundCloud } from '../../../../../types';

interface Props {
    showQueue: boolean;
    player: PlayerState;
    items: Array<SoundCloud.Track>;

    toggleQueue: typeof toggleQueue;
    updateQueue: typeof updateQueue;
    playTrack: typeof playTrack;
}

class Queue extends React.Component<Props> {

    private updateQueueDebounced: () => void;
    private list: ReactList | null = null;

    constructor(props: Props) {
        super(props);

        this.updateQueueDebounced = debounce(this.onScroll, 200);
    }

    componentDidMount() {
        const { player: { currentIndex, playingTrack } } = this.props;

        if (playingTrack) {
            if (playingTrack.id && this.list) {
                this.list.scrollTo(currentIndex);
            }
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const { showQueue } = this.props;

        if (showQueue !== nextProps.showQueue && nextProps.showQueue === true) {
            const { player: { currentIndex, playingTrack } } = nextProps;

            if (playingTrack) {
                if (playingTrack.id && this.list) {
                    this.list.scrollTo(currentIndex);
                }
            }
        }
    }

    handleClickOutside = () => {
        const { showQueue, toggleQueue } = this.props;
        if (showQueue) {
            toggleQueue(false);
        }
    }

    onScroll = () => {
        const { updateQueue } = this.props;

        if (this.list) {
            updateQueue(this.list.getVisibleRange());
        }
    }

    renderTrack = (index: number, key: number | string) => {
        const {
            player,
            items,
            playTrack,
        } = this.props;


        const { queue, currentPlaylistId, currentIndex } = player;

        const trackData = queue[index];
        const track = items[index];
        const currentPos = getCurrentPosition({ queue, playingTrack: trackData });

        return (
            <QueueItem
                key={key}
                index={index}
                track={track}
                currentPlaylist={currentPlaylistId || ''}
                trackData={trackData}
                played={currentPos < currentIndex}
                playing={currentPos === currentIndex}
                playTrack={playTrack}
            />
        );
    }

    render() {
        const { toggleQueue, player: { queue, currentIndex, currentPlaylistId }, showQueue } = this.props;

        if (!currentPlaylistId) return null;

        return (
            <aside
                className={cn('playQueue', {
                    show: showQueue,
                    hide: !showQueue
                })}
            >
                <div className='playqueue-title d-flex align-items-center justify-content-between'>
                    <div>Play Queue</div>
                    <a
                        href='javascript:void(0)'
                        onClick={() => {
                            toggleQueue(false);
                        }}
                    >
                        <i className='icon-close' />
                    </a>
                </div>
                <div className='tracks'>
                    {
                        showQueue && (
                            <CustomScroll
                                heightRelativeToParent='100%'
                                allowOuterScroll={true}
                                onScroll={this.updateQueueDebounced}
                                loader={<Spinner />}
                            >
                                <ReactList
                                    ref={(r) => this.list = r}
                                    pageSize={8}
                                    type='uniform'
                                    initialIndex={currentIndex}
                                    length={queue.length}
                                    useTranslate3d={true}
                                    itemRenderer={this.renderTrack}
                                />
                            </CustomScroll>
                        )
                    }
                </div>
            </aside>
        );
    }

}

export default Queue;
