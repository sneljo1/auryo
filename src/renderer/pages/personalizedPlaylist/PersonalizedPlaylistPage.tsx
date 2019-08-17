import { Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import { IMAGE_SIZES } from "@common/constants";
import { StoreState } from "@common/store";
import { getPlaylistEntity } from "@common/store/entities/selectors";
import { fetchPlaylistIfNeeded, fetchPlaylistTracks } from "@common/store/objects";
import { getPlaylistObjectSelector } from "@common/store/objects/selectors";
import { addUpNext, PlayerStatus, playTrack, toggleStatus } from "@common/store/player";
import { SC } from "@common/utils";
import { IPC } from "@common/utils/ipc";
import cn from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import PageHeader from "../../_shared/PageHeader/PageHeader";
import Spinner from "../../_shared/Spinner/Spinner";
import TracksGrid from "../../_shared/TracksGrid/TracksGrid";
import "./PlaylistPage.scss";

interface OwnProps extends RouteComponentProps<{ playlistId: string }> {
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
    scrollTop: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class PersonalizedPlaylistPage extends React.Component<AllProps, State> {

    public componentDidMount() {
        const { fetchPlaylistTracks, playlistIdParam } = this.props;

        fetchPlaylistTracks(playlistIdParam, 30);

    }

    public componentDidUpdate(nextProps: AllProps) {
        const { fetchPlaylistTracks, playlistIdParam } = this.props;

        if (playlistIdParam !== nextProps.playlistIdParam) {
            fetchPlaylistTracks(playlistIdParam, 30);
        }
    }

    public renderPlayButton = () => {
        const {
            playlist,
            playlistIdParam,
            isPlayerPlaylist,
            isPlaylistPlaying,
            playTrack,
            toggleStatus
        } = this.props;

        if (!playlist) { return null; }

        const first_id = playlist.tracks[0].id;

        if (isPlaylistPlaying) {
            return (
                <a
                    href="javascript:void(0)"
                    className="c_btn round colored"
                    onClick={() => {
                        toggleStatus();
                    }}
                >
                    <i className="bx bx-pause" />
                </a>
            );
        }

        const toggle = () => {
            if (isPlayerPlaylist) {
                toggleStatus();
            } else {
                playTrack(playlistIdParam.toString(), { id: first_id });
            }
        };

        return (
            <a
                href="javascript:void(0)"
                className="c_btn round colored"
                onClick={toggle}
            >
                <i className="bx bx-play" />
            </a>
        );
    }

    // tslint:disable-next-line: max-func-body-length
    public render() {
        const {
            // Vars
            playlistObject,
            playlist,
            playlistIdParam,
            // Functions
            fetchPlaylistTracks,
            addUpNext
        } = this.props;


        if (!playlistObject || !playlist || (playlistObject && playlistObject.items.length === 0 && playlistObject.isFetching)) {
            return <Spinner contained={true} />;
        }

        const first_item = playlist.tracks[0];
        const hasImage = playlist.artwork_url || playlist.calculated_artwork_url || (first_item && first_item.artwork_url);

        const permalink = `https://soundcloud.com/discover/sets/${playlist.permalink}`;
        const isEmpty = !playlistObject.isFetching && (playlistObject.items && playlistObject.items.length === 0);
        const image = hasImage ? SC.getImageUrl(playlist.artwork_url || playlist.calculated_artwork_url, IMAGE_SIZES.XLARGE) : null;

        return (
            <>

                <PageHeader
                    image={image}
                >

                    <h2>{playlist.title}</h2>
                    <div>
                        <div className="stats">
                            {playlist.description}
                        </div>

                        <div className="button-group">
                            {
                                first_item && !isEmpty ? (
                                    this.renderPlayButton()
                                ) : null
                            }

                            {
                                !isEmpty && (
                                    <Popover
                                        autoFocus={false}
                                        minimal={true}
                                        position={Position.BOTTOM_LEFT}
                                        content={(
                                            <Menu>
                                                {
                                                    playlist.tracks.length ? (
                                                        <React.Fragment>
                                                            <MenuItem
                                                                text="Add to queue"
                                                                onClick={() => {
                                                                    addUpNext(playlist);
                                                                }}
                                                            />
                                                            <MenuDivider />
                                                        </React.Fragment>
                                                    ) : null
                                                }

                                                <MenuItem
                                                    text="View in browser"
                                                    onClick={() => {
                                                        IPC.openExternal(permalink);
                                                    }}
                                                />

                                            </Menu>
                                        )}
                                    >
                                        <a href="javascript:void(0)" className="c_btn round">
                                            <i className="bx bx-dots-horizontal-rounded" />
                                        </a>
                                    </Popover>
                                )
                            }
                        </div>
                    </div>
                </PageHeader>
                {
                    isEmpty ? (
                        <div
                            className={cn({
                                "mt-5": !hasImage
                            })}
                        >
                            <h5 className="text-muted text-center">
                                This{" "}<a target="_blank" rel="noopener noreferrer" href={permalink}>playlist</a>{" "}
                                is empty or not available via a third party!</h5>
                            <div className="text-center" style={{ fontSize: "5rem" }}>
                                <span role="img">😲</span>
                            </div>
                        </div>
                    ) : (
                            <TracksGrid
                                items={playlistObject.items.slice(0, playlistObject.fetchedItems)}
                                objectId={playlistIdParam.toString()}
                                isLoading={playlistObject.isFetching}
                                loadMore={() => fetchPlaylistTracks(playlistIdParam, 30) as any}
                                isItemLoaded={(index) => !!playlistObject.items.slice(0, playlistObject.fetchedItems)[index]}
                            />

                        )
                }
            </>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { player: { currentPlaylistId, status } } = state;
    const { match: { params: { playlistId } } } = props;

    const isPlayerPlaylist = currentPlaylistId === playlistId;
    const isPlaylistPlaying = isPlayerPlaylist && status === PlayerStatus.PLAYING;

    return {
        isPlayerPlaylist,
        isPlaylistPlaying,
        playlist: getPlaylistEntity(playlistId as any)(state) as any,
        playlistObject: getPlaylistObjectSelector(playlistId)(state),
        playlistIdParam: playlistId as any,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    playTrack,
    fetchPlaylistIfNeeded,
    fetchPlaylistTracks,
    addUpNext,
    toggleStatus,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PersonalizedPlaylistPage);
