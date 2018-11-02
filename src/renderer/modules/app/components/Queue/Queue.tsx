import cn from 'classnames';
import { debounce } from 'lodash';
import * as React from 'react';
import * as ReactList from 'react-list';
import { PlayingTrack, updateQueue } from '../../../../../common/store/player';
import { toggleQueue } from '../../../../../common/store/ui';
import CustomScroll from '../../../_shared/CustomScroll';
import Spinner from '../../../_shared/Spinner/Spinner';
import QueueItem from './QueueItem';

interface Props {
    playingTrack: PlayingTrack | null;
    currentIndex: number;
    showQueue: boolean;
    items: Array<PlayingTrack>;

    toggleQueue: typeof toggleQueue;
    updateQueue: typeof updateQueue;
}

class Queue extends React.Component<Props> {

    private updateQueueDebounced: () => void;
    private list: ReactList | null = null;

    constructor(props: Props) {
        super(props);

        this.updateQueueDebounced = debounce(this.onScroll, 200);
    }

    componentDidMount() {
        const { currentIndex, playingTrack } = this.props;

        if (playingTrack && playingTrack.id && this.list) {
            this.list.scrollTo(currentIndex);
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const { showQueue } = this.props;

        if (showQueue !== nextProps.showQueue && nextProps.showQueue === true) {
            const { currentIndex, playingTrack } = nextProps;

            if (playingTrack && playingTrack.id && this.list) {
                this.list.scrollTo(currentIndex);
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
            items,
            currentIndex
        } = this.props;

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

    render() {
        const { toggleQueue, items, currentIndex , showQueue } = this.props;

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
                        <i className='bx bx-x' />
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
                                    length={items.length}
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
