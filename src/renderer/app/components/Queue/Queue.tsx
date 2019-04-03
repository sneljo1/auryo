import { StoreState } from '@common/store';
import { clearUpNext, updateQueue } from '@common/store/player';
import { getQueue } from '@common/store/player/selectors';
import { debounce } from 'lodash';
import * as React from 'react';
import * as ReactList from 'react-list';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import CustomScroll from '../../../_shared/CustomScroll';
import Spinner from '../../../_shared/Spinner/Spinner';
import './Queue.scss';
import QueueItem from './QueueItem';

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = PropsFromDispatch & PropsFromState;

class Queue extends React.PureComponent<AllProps> {

    private updateQueueDebounced: () => void;
    private list: ReactList | null = null;

    constructor(props: AllProps) {
        super(props);

        this.updateQueueDebounced = debounce(this.onScroll, 200);
    }

    componentDidMount() {
        const { currentIndex, playingTrack } = this.props;

        if (playingTrack && playingTrack.id && this.list) {
            this.list.scrollTo(currentIndex);
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
        const { items, currentIndex, upNext, clearUpNext } = this.props;

        return (
            <aside
                className='playQueue'
            >
                <div className='playqueue-title d-flex align-items-center justify-content-between'>
                    <div>Play Queue</div>
                    <div>
                        {
                            upNext.length > 0 && (
                                <a
                                    href='javascript:void(0)'
                                    className='clearQueue'
                                    onClick={() => {
                                        clearUpNext();
                                    }}
                                >
                                    Clear
                                </a>
                            )
                        }
                    </div>
                </div>
                <div className='tracks'>
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
                </div>
            </aside>
        );
    }

}

const mapStateToProps = (state: StoreState) => {
    const { player } = state;

    return {
        playingTrack: player.playingTrack,
        currentIndex: player.currentIndex,
        upNext: player.upNext,
        items: getQueue(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    updateQueue,
    clearUpNext,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, {}, StoreState>(mapStateToProps, mapDispatchToProps)(Queue);
