/* eslint-disable react/no-this-in-sfc,jsx-a11y/accessible-emoji */
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { MenuDivider } from '@blueprintjs/core/lib/cjs/components/menu/menuDivider';
import cn from 'classnames';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { IMAGE_SIZES } from '../../../shared/constants';
import { playlistSchema, trackSchema } from '../../../shared/schemas';
import { StoreState } from '../../../shared/store';
import { AuthState } from '../../../shared/store/auth';
import { canFetchPlaylistTracks, fetchPlaylistIfNeeded, fetchPlaylistTracks, ObjectState, ObjectTypes } from '../../../shared/store/objects';
import { addUpNext, PlayerState, PlayerStatus, playTrack, toggleStatus } from '../../../shared/store/player';
import { toggleLike } from '../../../shared/store/track/actions';
import { setScrollPosition } from '../../../shared/store/ui';
import { getReadableTimeFull, SC } from '../../../shared/utils';
import { IPC } from '../../../shared/utils/ipc';
import { SoundCloud } from '../../../types';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import PageHeader from '../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../_shared/ShareMenuItem';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';
import WithHeaderComponent from '../_shared/WithHeaderComponent';

interface OwnProps extends RouteComponentProps<{ playlistId: string }> {
}

interface PropsFromState {
    auth: AuthState;
    player: PlayerState;
    previousScrollTop?: number;
    playlistId: string;
    playlist: SoundCloud.Playlist;
    playlistObject: ObjectState<SoundCloud.Track> | null;
}

interface PropsFromDispatch {
    playTrack: typeof playTrack;
    setScrollPosition: typeof setScrollPosition;
    toggleLike: typeof toggleLike;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
    fetchPlaylistTracks: typeof fetchPlaylistTracks;
    canFetchPlaylistTracks: typeof canFetchPlaylistTracks;
    addUpNext: typeof addUpNext;
    toggleStatus: typeof toggleStatus;
}

interface State {
    scrollTop: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class PlaylistContainer extends WithHeaderComponent<AllProps, State> {

    componentDidMount() {
        super.componentDidMount();

        const { fetchPlaylistIfNeeded, playlistId } = this.props;

        fetchPlaylistIfNeeded(playlistId);

    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { fetchPlaylistIfNeeded, playlistId } = this.props;

        if (playlistId !== nextProps.playlistId) {
            fetchPlaylistIfNeeded(nextProps.playlistId);
        }
    }

    renderPlayButton = () => {
        const {
            playlist,
            playlistId,
            player,
            playTrack,
            toggleStatus
        } = this.props;

        const first_id = playlist.tracks[0].id;

        if (player.currentPlaylistId === playlistId && player.status === PlayerStatus.PLAYING) {
            return (
                <a href='javascript:void(0)' className='c_btn playing'
                    onClick={() => toggleStatus()}>
                    <i className='icon-pause' />
                    Playing
                </a>
            );
        }

        return (
            <a href='javascript:void(0)' className='c_btn'
                onClick={player.currentPlaylistId === playlistId ? toggleStatus.bind(null, null) : playTrack.bind(null, playlistId, first_id, null)}>
                <i className='icon-play_arrow' />
                Play
            </a>
        );
    }

    render() {
        const {
            // Vars
            playlistObject,
            playlist,
            playlistId,
            player,
            auth,

            // Functions
            toggleLike,
            playTrack,
            fetchPlaylistIfNeeded,
            fetchPlaylistTracks,
            canFetchPlaylistTracks,
            addUpNext
        } = this.props;

        const { likes, playlists, followings } = auth;

        if (!playlistObject || !playlist || (playlistObject && playlistObject.items.length === 0 && playlistObject.isFetching)) {
            return <Spinner contained={true} />;
        }

        const first_item = playlist.tracks[0];
        const hasImage = playlist.artwork_url || (first_item && first_item.artwork_url);

        const liked = SC.hasID(playlistId, likes.playlist);
        const playlistOwned = playlists.find(p => p.id === playlist.id);

        const openExternalFunc = IPC.openExternal.bind(null, playlist.permalink_url);

        const isEmpty = !playlistObject.isFetching && (playlist.tracks.length === 0 && playlist.duration === 0 || playlist.track_count === 0);

        return (
            <CustomScroll heightRelativeToParent='100%'
                heightMargin={35}
                allowOuterScroll={true}
                threshold={300}
                isFetching={playlistObject.isFetching}
                ref={(r) => this.scroll = r}
                loadMore={() => {
                    fetchPlaylistTracks(playlistId)
                }}
                loader={<Spinner />}
                onScroll={this.debouncedOnScroll}
                hasMore={canFetchPlaylistTracks(playlistId)}>

                <Header className={cn({
                    withImage: hasImage
                })} scrollTop={this.state.scrollTop} />

                <PageHeader
                    image={hasImage ? SC.getImageUrl(playlist.artwork_url || first_item.artwork_url, IMAGE_SIZES.XLARGE) : null}>

                    <h2>{playlist.title}</h2>
                    <div>
                        <div className='stats'>
                            {playlist.track_count} titles{' - '}{getReadableTimeFull(playlist.duration, true)}
                        </div>

                        <div className='button-group'>
                            {
                                first_item ? (
                                    this.renderPlayButton()
                                ) : null
                            }


                            {
                                playlist.tracks.length && !playlistOwned ? (
                                    <a href='javascript:void(0)' className={cn('c_btn', { liked })}
                                        onClick={toggleLike.bind(this, playlist.id, true)}>
                                        <i className={liked ? 'icon-favorite' : 'icon-favorite_border'} />
                                        <span>{liked ? 'Liked' : 'Like'}</span>
                                    </a>
                                ) : null
                            }

                            {
                                !isEmpty && (
                                    <Popover autoFocus={false} minimal={true} content={(
                                        <Menu>
                                            {
                                                playlist.tracks.length ? (
                                                    <React.Fragment>
                                                        <MenuItem text='Add to queue'
                                                            onClick={addUpNext.bind(this, playlist, null)} />
                                                        <MenuDivider />
                                                    </React.Fragment>
                                                ) : null
                                            }

                                            <MenuItem
                                                text='View in browser'
                                                onClick={openExternalFunc} />
                                            <ShareMenuItem title={playlist.title}
                                                permalink={playlist.permalink_url}
                                                username={playlist.user.username} />
                                        </Menu>
                                    )} position={Position.BOTTOM_LEFT}>
                                        <a href='javascript:void(0)' className='c_btn round'>
                                            <i className='icon-more_horiz' />
                                        </a>
                                    </Popover>
                                )
                            }


                            {
                                // TODO: re-add deleting of playlists maybe? Takes a while before it actually deletes it, which is annoying
                            }

                            {/* <a href='javascript:void(0)' className='c_btn'
                         {
                         items.user_id === me.id ? (
                         <a href="javascript:void(0)" className="c_btn"
                         onClick={deletePlaylist.bind(null, playlistId)}>
                         <i className="icon-close"/>
                         Delete
                         </a>
                         ) : null
                         }
                         </a> */}
                        </div>
                    </div>
                </PageHeader>
                {
                    isEmpty ? (
                        <div className='pt-5 mt-5'>
                            <h5 className='text-muted text-center'>
                                This{' '}<a target='_blank' rel='noopener noreferrer' href={playlist.permalink_url}>playlist</a>{' '}
                                is empty or not available via a third party!</h5>
                            <div className='text-center' style={{ fontSize: '5rem' }}>
                                <span role='img'>😲</span>
                            </div>
                        </div>
                    ) : (
                            <TracksGrid
                                followings={followings}
                                items={playlistObject.items}
                                player={player}
                                objectId={playlistId}
                                playTrack={playTrack}
                                fetchPlaylistIfNeeded={fetchPlaylistIfNeeded} />

                        )
                }
            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { entities, objects, player, auth, ui } = state;

    const { match: { params: { playlistId } }, location, history } = props;

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {};
    const playlistObject = playlistObjects[playlistId];

    const playlist = denormalize(playlistId, playlistSchema, entities);

    let dPlaylistObject: ObjectState<SoundCloud.Track> | null = null;

    if (playlistObject) {
        dPlaylistObject = denormalize(playlistObject, new schema.Object({
            items: new schema.Array({
                tracks: trackSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    console.log(dPlaylistObject)

    return {
        auth,
        player,
        playlist,
        playlistObject: dPlaylistObject,
        playlistId,
        previousScrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    playTrack,
    setScrollPosition,
    toggleLike,
    fetchPlaylistIfNeeded,
    fetchPlaylistTracks,
    canFetchPlaylistTracks,
    addUpNext,
    toggleStatus,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaylistContainer));
