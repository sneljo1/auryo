import { Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import { IMAGE_SIZES } from "@common/constants";
import { StoreState } from "@common/store";
import { getPlaylistEntity } from "@common/store/entities/selectors";
import { fetchPlaylistIfNeeded, fetchPlaylistTracks } from "@common/store/objects";
import { getPlaylistObjectSelector } from "@common/store/objects/selectors";
import { addUpNext, PlayerStatus, playTrack, toggleStatus } from "@common/store/player";
import { toggleLike, toggleRepost } from "@common/store/track/actions";
import { getReadableTimeFull, SC } from "@common/utils";
import { IPC } from "@common/utils/ipc";
import { SetLayoutSettings } from "@renderer/_shared/context/contentContext";
import cn from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import PageHeader from "../../_shared/PageHeader/PageHeader";
import ShareMenuItem from "../../_shared/ShareMenuItem";
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

class PlaylistPage extends React.Component<AllProps, State> {

    public componentDidMount() {
        const { fetchPlaylistIfNeeded, playlistIdParam } = this.props;

        fetchPlaylistIfNeeded(playlistIdParam);

    }

    public componentDidUpdate(prevProps: AllProps) {
        const { fetchPlaylistIfNeeded, playlistIdParam } = this.props;

        if (playlistIdParam !== prevProps.playlistIdParam) {
            fetchPlaylistIfNeeded(playlistIdParam);
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
                playTrack(playlistIdParam.toString());
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

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public render() {
        const {
            // Vars
            playlistObject,
            playlist,
            auth,
            playlistIdParam,
            // Functions
            toggleLike,
            toggleRepost,
            fetchPlaylistTracks,
            addUpNext
        } = this.props;

        const { likes, playlists, reposts } = auth;

        if (!playlistObject || !playlist || (playlistObject && playlistObject.items.length === 0 && playlistObject.isFetching)) {
            return <Spinner contained={true} />;
        }

        const first_item = playlist.tracks[0];
        const hasImage = playlist.artwork_url || (first_item && first_item.artwork_url);

        const liked = SC.hasID(playlistIdParam, likes.playlist);
        const reposted = SC.hasID(playlistIdParam, reposts.playlist);
        const playlistOwned = playlists.find((p) => p.id === playlist.id);

        const isEmpty = !playlistObject.isFetching && (playlist.tracks.length === 0 && playlist.duration === 0 || playlist.track_count === 0);

        const likedIcon = liked ? "bx bxs-heart" : "bx bx-heart";
        const image = hasImage ? SC.getImageUrl(playlist.artwork_url || first_item.artwork_url, IMAGE_SIZES.XLARGE) : null;

        const hasMore = playlistObject.items.length > playlistObject.fetchedItems;

        return (
            <>
                <SetLayoutSettings hasImage={hasImage} />

                <PageHeader
                    image={image}
                >


                    <h2>{playlist.title}</h2>
                    <div>
                        <div className="stats">
                            {playlist.track_count} titles{" - "}{getReadableTimeFull(playlist.duration, true)}
                        </div>

                        <div className="button-group">
                            {
                                first_item && !isEmpty ? (
                                    this.renderPlayButton()
                                ) : null
                            }


                            {
                                playlist.tracks.length && !playlistOwned ? (
                                    <a
                                        href="javascript:void(0)"
                                        className={cn("c_btn", { active: liked })}
                                        onClick={() => {
                                            toggleLike(playlist.id, true);
                                        }}
                                    >
                                        <i className={likedIcon} />
                                        <span>{liked ? "Liked" : "Like"}</span>
                                    </a>
                                ) : null
                            }

                            {
                                playlist.tracks.length && !playlistOwned ? (
                                    <a
                                        href="javascript:void(0)"
                                        className={cn("c_btn", { "text-primary": reposted })}
                                        onClick={() => {
                                            toggleRepost(playlist.id, true);
                                        }}
                                    >
                                        <i className="bx bx-repost" />
                                        <span>{reposted ? "Reposted" : "Repost"}</span>
                                    </a>
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
                                                        IPC.openExternal(playlist.permalink_url);
                                                    }}
                                                />
                                                {
                                                    playlist.user && (
                                                        <ShareMenuItem
                                                            title={playlist.title}
                                                            permalink={playlist.permalink_url}
                                                            username={playlist.user.username}
                                                        />
                                                    )
                                                }

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
                                This{" "}<a target="_blank" rel="noopener noreferrer" href={playlist.permalink_url}>playlist</a>{" "}
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
                                isItemLoaded={(index) => !!playlistObject.items[index]}
                                loadMore={() => fetchPlaylistTracks(playlistIdParam, 30) as any}
                                hasMore={hasMore}
                            />

                        )
                }
            </>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { player: { currentPlaylistId, status }, auth } = state;
    const { match: { params: { playlistId } } } = props;

    const isPlayerPlaylist = currentPlaylistId === playlistId;
    const isPlaylistPlaying = isPlayerPlaylist && status === PlayerStatus.PLAYING;

    return {
        auth,
        isPlayerPlaylist,
        isPlaylistPlaying,
        playlist: getPlaylistEntity(playlistId as any)(state),
        playlistObject: getPlaylistObjectSelector(playlistId)(state),
        playlistIdParam: playlistId as any,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    playTrack,
    toggleLike,
    toggleRepost,
    fetchPlaylistIfNeeded,
    fetchPlaylistTracks,
    addUpNext,
    toggleStatus,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistPage);
