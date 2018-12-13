import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { IMAGE_SIZES } from '../../../common/constants';
import { StoreState } from '../../../common/store';
import { getPlaylistEntity } from '../../../common/store/entities/selectors';
import { fetchPlaylistIfNeeded, fetchPlaylistTracks, ObjectState } from '../../../common/store/objects';
import { getPlaylistObjectSelector } from '../../../common/store/objects/selectors';
import { addUpNext, PlayerStatus, playTrack, toggleStatus } from '../../../common/store/player';
import { setScrollPosition } from '../../../common/store/ui';
import { getPreviousScrollTop } from '../../../common/store/ui/selectors';
import { SC } from '../../../common/utils';
import { IPC } from '../../../common/utils/ipc';
import { NormalizedResult, SoundCloud } from '../../../types';
import Header from '../../app/components/Header/Header';
import CustomScroll from '../../_shared/CustomScroll';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';
import WithHeaderComponent from '../../_shared/WithHeaderComponent';
import './PlaylistPage.scss';
import _ = require('lodash');

interface OwnProps extends RouteComponentProps<{ playlistId: string }> {
}

interface PropsFromState {
    isPlayerPlaylist: boolean;
    isPlaylistPlaying: boolean;
    previousScrollTop?: number;
    playlist: SoundCloud.SystemPlaylist | null;
    playlistObject: ObjectState<NormalizedResult> | null;
    playlistIdParam: number;
}

interface PropsFromDispatch {
    playTrack: typeof playTrack;
    setScrollPosition: typeof setScrollPosition;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
    fetchPlaylistTracks: typeof fetchPlaylistTracks;
    addUpNext: typeof addUpNext;
    toggleStatus: typeof toggleStatus;
}

interface State {
    scrollTop: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class PersonalizedPlaylistPage extends WithHeaderComponent<AllProps, State> {

    componentDidMount() {
        super.componentDidMount();

        const { fetchPlaylistTracks, playlistIdParam } = this.props;

        fetchPlaylistTracks(playlistIdParam, 30);

    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { fetchPlaylistTracks, playlistIdParam } = this.props;

        if (playlistIdParam !== nextProps.playlistIdParam) {
            fetchPlaylistTracks(playlistIdParam, 30);
        }
    }

    renderPlayButton = () => {
        const {
            playlist,
            playlistIdParam,
            isPlayerPlaylist,
            isPlaylistPlaying,
            playTrack,
            toggleStatus
        } = this.props;

        if (!playlist) return null;

        const first_id = playlist.tracks[0].id;

        if (isPlaylistPlaying) {
            return (
                <a
                    href='javascript:void(0)'
                    className='c_btn round playButton'
                    onClick={() => toggleStatus()}
                >
                    <i className='bx bx-pause' />
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
                href='javascript:void(0)'
                className='c_btn round playButton'
                onClick={toggle}
            >
                <i className='bx bx-play' />
            </a>
        );
    }

    render() {
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

        console.log(isEmpty, playlist, playlistObject);

        return (
            <CustomScroll
                heightRelativeToParent='100%'
                allowOuterScroll={true}
                threshold={300}
                isFetching={playlistObject.isFetching}
                ref={(r) => this.scroll = r}
                loadMore={() => {
                    fetchPlaylistTracks(playlistIdParam, 30);
                }}
                loader={<Spinner />}
                onScroll={this.debouncedOnScroll}
            >

                <Header
                    className={cn({
                        withImage: hasImage
                    })}
                    scrollTop={this.state.scrollTop}
                />

                <PageHeader
                    image={hasImage ? SC.getImageUrl(playlist.artwork_url || playlist.calculated_artwork_url, IMAGE_SIZES.XLARGE) : null}
                >

                    <h2>{playlist.title}</h2>
                    <div>
                        <div className='stats'>
                            {playlist.description}
                        </div>

                        <div className='button-group'>
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
                                                                text='Add to queue'
                                                                onClick={() => {
                                                                    addUpNext(playlist as any);
                                                                }}
                                                            />
                                                            <MenuDivider />
                                                        </React.Fragment>
                                                    ) : null
                                                }

                                                <MenuItem
                                                    text='View in browser'
                                                    onClick={() => {
                                                        IPC.openExternal(permalink);
                                                    }}
                                                />

                                            </Menu>
                                        )}
                                    >
                                        <a href='javascript:void(0)' className='c_btn round'>
                                            <i className='bx bx-dots-horizontal-rounded' />
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
                                'mt-5': !hasImage
                            })}
                        >
                            <h5 className='text-muted text-center'>
                                This{' '}<a target='_blank' rel='noopener noreferrer' href={permalink}>playlist</a>{' '}
                                is empty or not available via a third party!</h5>
                            <div className='text-center' style={{ fontSize: '5rem' }}>
                                <span role='img'>😲</span>
                            </div>
                        </div>
                    ) : (
                            <TracksGrid
                                items={playlistObject.items.slice(0, playlistObject.fetchedItems)}
                                objectId={playlistIdParam.toString()}
                            />

                        )
                }
            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
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
        previousScrollTop: getPreviousScrollTop(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    playTrack,
    setScrollPosition,
    fetchPlaylistIfNeeded,
    fetchPlaylistTracks,
    addUpNext,
    toggleStatus,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PersonalizedPlaylistPage);
