import React from 'react'
import PropTypes from 'prop-types'
import './queue.scss'
import QueueItem from './queueItem.component'
import { getCurrentPosition } from '../../../../../shared/utils/playerUtils'
import cn from 'classnames'
import * as SC from '../../../../../shared/utils/soundcloudUtils'
import CustomScroll from '../../../_shared/CustomScroll'
import ReactList from 'react-list'
import Spinner from '../../../_shared/Spinner/spinner.component'
import debounce from 'lodash/debounce'

const enhanceWithClickOutside = require('react-click-outside')

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

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.showQueue !== nextProps.showQueue && nextProps.showQueue === true) {
            const { player: { currentIndex, playingTrack } } = nextProps

            if (playingTrack.id && this.list) {
                this.list.scrollTo(currentIndex)
            }
        }
    }

    handleClickOutside = () => {
        if (this.props.showQueue) {
            this.props.toggleQueue(false)
        }
    }

    onScroll = () => {
        const range = this.list.getVisibleRange()

        this.props.updateQueue(range)

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
                                          allowOuterScroll={true}
                                          onScroll={this.updateQueueDebounced}
                                          loader={<Spinner />}>
                                <ReactList
                                    ref={r => this.list = r}
                                    pageSize={8}
                                    type="uniform"
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
        )
    }

    renderTrack = (index, key) => {
        const {
            // Vars
            player,
            likes,
            reposts,
            items,

            // Functions
            toggleLike,
            toggleRepost,
            show,
            playTrack,
            push,
            addUpNext
        } = this.props

        const { queue, playingTrack, currentPlaylistId, currentIndex } = player

        const trackData = queue[index]

        const track = items[index]

        const current_pos = getCurrentPosition(queue, trackData)

        const liked = SC.hasID(track.id, likes.track)
        const reposted = SC.hasID(track.id, reposts)

        return <QueueItem key={key}
                          index={index}
                          track={track}
                          currentPlaylist={currentPlaylistId}
                          liked={liked}
                          reposted={reposted}
                          playingTrack={playingTrack}
                          trackData={trackData}

                          played={current_pos < currentIndex}
                          playing={current_pos === currentIndex}

                          push={push}
                          playTrack={playTrack}
                          addUpNext={addUpNext}
                          show={show}
                          toggleLike={toggleLike}
                          toggleRepost={toggleRepost} />
    }

}

Queue.propTypes = {
    showQueue: PropTypes.bool,
    player: PropTypes.object.isRequired,
    show: PropTypes.func.isRequired,
    likes: PropTypes.object.isRequired,
    reposts: PropTypes.object.isRequired,

    toggleQueue: PropTypes.func.isRequired,
    updateQueue: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    playTrack: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired

}

export default Queue
