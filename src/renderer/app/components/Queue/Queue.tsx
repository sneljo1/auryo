import { StoreState } from "@common/store";
import { clearUpNext, PlayingTrack, updateQueue, UpNextState } from "@common/store/player";
import { getQueue } from "@common/store/player/selectors";
import { toggleQueue } from "@common/store/ui";
import cn from "classnames";
import { debounce } from "lodash";
import * as React from "react";
import * as ReactList from "react-list";
import { connect, MapDispatchToProps } from "react-redux";
import { bindActionCreators } from "redux";
import CustomScroll from "../../../_shared/CustomScroll";
import Spinner from "../../../_shared/Spinner/Spinner";
import "./Queue.scss";
import QueueItem from "./QueueItem";

interface PropsFromState {
    playingTrack: PlayingTrack | null;
    currentIndex: number;
    showQueue: boolean;
    upNext: UpNextState;
    items: PlayingTrack[];
}

interface PropsFromDispatch {
    toggleQueue: typeof toggleQueue;
    updateQueue: typeof updateQueue;
    clearUpNext: typeof clearUpNext;
}

type AllProps = PropsFromDispatch & PropsFromState;

class Queue extends React.PureComponent<AllProps> {

    private readonly updateQueueDebounced: () => void;
    private list: ReactList | null = null;

    constructor(props: AllProps) {
        super(props);

        this.updateQueueDebounced = debounce(this.onScroll, 200);
    }

    public componentDidMount() {
        const { currentIndex, playingTrack } = this.props;

        if (playingTrack && playingTrack.id && this.list) {
            this.list.scrollTo(currentIndex);
        }
    }

    public componentDidUpdate(prevProps: AllProps) {
        const { showQueue, currentIndex, playingTrack } = this.props;

        if (showQueue !== prevProps.showQueue && showQueue === true) {

            if (playingTrack && playingTrack.id && this.list) {
                this.list.scrollTo(currentIndex);
            }
        }
    }

    public handleClickOutside = () => {
        const { showQueue, toggleQueue } = this.props;

        if (showQueue) {
            toggleQueue(false);
        }
    }

    public onScroll = () => {
        const { updateQueue } = this.props;

        if (this.list) {
            updateQueue(this.list.getVisibleRange());
        }
    }

    public renderTrack = (index: number, key: number | string) => {
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

    public render() {
        const { toggleQueue, items, currentIndex, showQueue, upNext, clearUpNext } = this.props;

        return (
            <aside
                className={cn("playQueue", {
                    show: showQueue,
                    hide: !showQueue
                })}
            >
                <div className="playqueue-title d-flex align-items-center justify-content-between">
                    <div>Play Queue</div>
                    <div>
                        {
                            upNext.length > 0 && (
                                <a
                                    href="javascript:void(0)"
                                    className="clearQueue"
                                    onClick={() => {
                                        clearUpNext();
                                    }}
                                >
                                    Clear
                                </a>
                            )
                        }
                        <a
                            href="javascript:void(0)"
                            onClick={() => {
                                toggleQueue(false);
                            }}
                        >
                            <i className="bx bx-x" />
                        </a>
                    </div>
                </div>
                <div className="tracks">
                    {
                        showQueue && (
                            <CustomScroll
                                heightRelativeToParent="100%"
                                allowOuterScroll={true}
                                onScroll={this.updateQueueDebounced}
                                loader={<Spinner />}
                            >
                                <ReactList
                                    ref={(r) => this.list = r}
                                    pageSize={8}
                                    type="uniform"
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

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { player, ui } = state;

    return {
        playingTrack: player.playingTrack,
        currentIndex: player.currentIndex,
        showQueue: ui.showQueue,
        upNext: player.upNext,
        items: getQueue(state),
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, {}> = (dispatch) => bindActionCreators({

    toggleQueue,
    updateQueue,
    clearUpNext,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, {}, StoreState>(mapStateToProps, mapDispatchToProps)(Queue);
