import { Classes } from "@blueprintjs/core";
import { StoreState } from "@common/store";
import { clearUpNext, updateQueue } from "@common/store/player";
import { getQueue } from "@common/store/player/selectors";
import { autobind } from "core-decorators";
import { debounce } from "lodash";
import * as React from "react";
import Scrollbars from "react-custom-scrollbars";
import * as ReactList from "react-list";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import "./Queue.scss";
import QueueItem from "./QueueItem";

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = PropsFromDispatch & PropsFromState;

@autobind
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

    public onScroll() {
        const { updateQueue } = this.props;

        if (this.list) {
            updateQueue(this.list.getVisibleRange());
        }
    }

    public renderTrack(index: number, key: number | string) {
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
        const { items, currentIndex, upNext, clearUpNext } = this.props;

        return (
            <aside
                className="playQueue"
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
                            className={Classes.POPOVER_DISMISS}
                        >
                            <i className="bx bx-x" />
                        </a>
                    </div>
                </div>
                <div className="tracks">
                    <Scrollbars
                        onScroll={this.updateQueueDebounced}
                        renderTrackHorizontal={props => <div></div>}
                        renderTrackVertical={props => <div {...props} className="track-vertical" />}
                        renderThumbHorizontal={props => <div></div>}
                        renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
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
                    </Scrollbars>
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
