import cn from 'classnames';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';
import ReactList from 'react-list';
import { getCurrentPosition } from '../../../../../shared/utils/playerUtils';
import CustomScroll from '../../../_shared/CustomScroll';
import Spinner from '../../../_shared/Spinner/Spinner';
import './queue.scss';
import QueueItem from './QueueItem';

class Queue extends React.Component {

    constructor() {
        super()

        this.updateQueueDebounced = debounce(this.onScroll, 200)
    }

    componentDidMount() {
        const { player: { currentIndex, playingTrack } } = this.props

        if (playingTrack.id && this.list) {
            this.list.scrollTo(currentIndex)
        }
    }

    componentWillReceiveProps(nextProps) {
        const { showQueue } = this.props;

        if (showQueue !== nextProps.showQueue && nextProps.showQueue === true) {
            const { player: { currentIndex, playingTrack } } = nextProps

            if (playingTrack.id && this.list) {
                this.list.scrollTo(currentIndex)
            }
        }
    }

    handleClickOutside = () => {
        const { showQueue, toggleQueue } = this.props;
        if (showQueue) {
            toggleQueue(false)
        }
    }

    onScroll = () => {
        const { updateQueue } = this.props;

        const range = this.list.getVisibleRange()

        updateQueue(range)
    }

    renderTrack = (index, key) => {
        const {
            // Vars
            player,
            items,

            // Functions
            playTrack,
        } = this.props

        const { queue, playingTrack, currentPlaylistId, currentIndex } = player

        const trackData = queue[index]

        const track = items[index]

        const current_pos = getCurrentPosition(queue, trackData)

        return <QueueItem key={key}
            index={index}
            track={track}
            currentPlaylist={currentPlaylistId}
            playingTrack={playingTrack}
            trackData={trackData}

            played={current_pos < currentIndex}
            playing={current_pos === currentIndex}

            playTrack={playTrack} />
    }

    render() {
        const { toggleQueue, player: { queue, currentIndex }, showQueue } = this.props

        return (

            <aside className={cn('playQueue', {
                show: showQueue,
                hide: !showQueue
            })}>
                <div className="playqueue-title d-flex align-items-center justify-content-between">
                    <div>Play Queue</div>
                    <a href="javascript:void(0)" onClick={() => {
                        toggleQueue(false)
                    }}>
                        <i className="icon-close" />
                    </a>
                </div>
                <div className="tracks">
                    {
                        showQueue && (
                            <CustomScroll heightRelativeToParent="100%"
                                allowOuterScroll
                                onScroll={this.updateQueueDebounced}
                                loader={<Spinner />}>
                                <ReactList
                                    ref={r => this.list = r}
                                    pageSize={8}
                                    type="uniform"
                                    initialIndex={currentIndex}
                                    length={queue.length}
                                    useTranslate3d
                                    itemRenderer={this.renderTrack}
                                />
                            </CustomScroll>
                        )
                    }
                </div>
            </aside>
        )
    }

}

Queue.propTypes = {
    showQueue: PropTypes.bool,
    player: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,

    toggleQueue: PropTypes.func.isRequired,
    updateQueue: PropTypes.func.isRequired,
    playTrack: PropTypes.func.isRequired,
}

Queue.defaultProps = {
    showQueue: false
}

export default Queue
