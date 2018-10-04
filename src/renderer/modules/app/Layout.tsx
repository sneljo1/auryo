import { Intent, IResizeEntry, IToastOptions, ResizeSensor } from '@blueprintjs/core';
import cn from 'classnames';
import is from 'electron-is';
import debounce from 'lodash/debounce';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import playlistSchema from '../../../shared/schemas/playlist';
import trackSchema from '../../../shared/schemas/track';
import { StoreState } from '../../../shared/store';
import { AppState, initApp, setDimensions, stopWatchers, toggleOffline } from '../../../shared/store/app';
import { AuthState } from '../../../shared/store/auth';
import { EntitiesState } from '../../../shared/store/objects';
import { PlayerState, playTrack, updateQueue } from '../../../shared/store/player';
import { addToast, clearToasts, removeToast, toggleQueue } from '../../../shared/store/ui';
import ArtistPage from '../artist/ArtistPage';
import ChartsDetailsPage from '../charts/ChartsDetailsPage';
import ChartsPage from '../charts/ChartsPage';
import PlayerContainer from '../player/Player';
import PlaylistPage from '../playlist/PlaylistPage';
import FeedPlaylistPage from '../playlists/FeedPlaylistPage';
import LikesPlaylistPage from '../playlists/LikesPlaylistPage';
import MyPlaylistsPage from '../playlists/MyPlaylistsPage';
import MyTracksPage from '../playlists/MyTracksPage';
import SearchWrapper from '../search/SearchWrapper';
import TrackPage from '../track/TrackPage';
import ErrorBoundary from '../_shared/ErrorBoundary';
import Spinner from '../_shared/Spinner/Spinner';
import AppError from './components/AppError/AppError';
import ChangelogModal from './components/modals/ChangeLogModal/ChangelogModal';
import UtilitiesModal from './components/modals/UtilitiesModel/UtilitiesModal';
import IsOffline from './components/Offline/Offline';
import Queue from './components/Queue/Queue';
import SideBar from './components/Sidebar/Sidebar';
import Toastr from './components/Toastr';
import { SoundCloud } from '../../../types';

interface PropsFromState {
    showQueue: boolean;
    toasts: Array<IToastOptions>;

    entities: EntitiesState;
    auth: AuthState;
    player: PlayerState;
    app: AppState;

    userPlayerlists: SoundCloud.Playlist[];
    queue: SoundCloud.Track[];
}

interface PropsFromDispatch {
    initApp: typeof initApp;
    toggleOffline: typeof toggleOffline;
    addToast: typeof addToast;
    clearToasts: typeof clearToasts;
    removeToast: typeof removeToast;
    setDimensions: typeof setDimensions;
    toggleQueue: typeof toggleQueue;
    updateQueue: typeof updateQueue;
    playTrack: typeof playTrack;
}

type AllProps = PropsFromState & PropsFromDispatch;

class Layout extends React.Component<AllProps> {

    private debouncedHandleResize: any;

    constructor(props: AllProps) {
        super(props);

        this.debouncedHandleResize = debounce(this.handleResize, 500, { leading: true });
    }

    componentDidMount() {
        const { initApp } = this.props;

        initApp();

        window.addEventListener('online', this.setOnlineStatus);
        window.addEventListener('offline', this.setOnlineStatus);

    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { app, addToast, removeToast } = this.props;

        if (app.offline !== nextProps.app.offline && nextProps.app.offline === true) {
            addToast({
                key: 'offline',
                intent: Intent.PRIMARY,
                message: 'You are currently offline.'
            });
        } else if (app.offline !== nextProps.app.offline && nextProps.app.offline === false) {
            removeToast('offline');
        }
    }

    componentWillUnmount() {

        stopWatchers();

        window.removeEventListener('online', this.setOnlineStatus);
        window.removeEventListener('offline', this.setOnlineStatus);
    }

    setOnlineStatus = () => {
        const { toggleOffline } = this.props;

        toggleOffline(!navigator.onLine);
    }

    renderMain = () => {
        const { app } = this.props;

        if (!app.loaded && app.offline) {
            return <IsOffline full={true} />;
        }

        return (
            <div className='f-height'>
                <Switch>
                    <Route exact={true} path='/' component={FeedPlaylistPage} />
                    <Route exact={true} path='/charts' component={ChartsPage} />
                    <Route path='/charts/:genre' component={ChartsDetailsPage} />
                    <Route path='/likes' component={LikesPlaylistPage} />
                    <Route path='/mytracks' component={MyTracksPage} />
                    <Route path='/myplaylists' component={MyPlaylistsPage} />
                    <Route path='/track/:songId' component={TrackPage} />
                    <Route path='/user/:artistId' component={ArtistPage} />
                    <Route path='/playlist/:playlistId' component={PlaylistPage} />
                    <Route path='/search/:query?' component={SearchWrapper} />
                </Switch>
            </div>
        );
    }

    handleResize = ([{ contentRect: { width, height } }]: Array<IResizeEntry>) => {

        const { setDimensions } = this.props;

        setDimensions({
            height,
            width
        });
    }

    render() {
        const {
            // Vars
            app,
            showQueue,
            player,
            children,
            // Functions
            playTrack,
            updateQueue,
            toggleQueue,
            initApp,
            toasts,
            clearToasts,
            queue, userPlayerlists
        } = this.props;

        return (
            <ResizeSensor
                onResize={this.debouncedHandleResize}
            >

                <div className={cn('body auryo', { development: !(process.env.NODE_ENV === 'production'), mac: is.osx() })}>
                    {
                        !app.loaded && !app.offline && !app.loading_error ? <Spinner full={true} /> : null}

                    {
                        app.loading_error ? <AppError error={app.loading_error} initApp={initApp} /> : null}

                    <main className={cn('d-flex flex-nowrap', {
                        playing: player.playingTrack
                    })}>
                        <SideBar
                            playing={!!player.playingTrack}
                            currentPlaylistId={player.currentPlaylistId}
                            playlists={userPlayerlists} />

                        <Queue
                            showQueue={showQueue}
                            items={queue}
                            player={player}

                            updateQueue={updateQueue}
                            toggleQueue={toggleQueue}
                            playTrack={playTrack} />

                        <section className='content'>
                            <Toastr toasts={toasts} clearToasts={clearToasts} />

                            <div className='f-height'>
                                <ErrorBoundary initApp={initApp}>
                                    {children}
                                </ErrorBoundary>
                            </div>
                        </section>
                    </main>

                    <footer className='fixed-bottom player-container'>
                        <PlayerContainer />
                    </footer>

                    {/* Register Modals */}

                    <UtilitiesModal />
                    <ChangelogModal />

                </div>
            </ResizeSensor>
        );
    }
}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { auth, app, player, entities, ui } = state;

    const deNormalizedPlaylists = denormalize(auth.playlists, new schema.Array({
        playlists: playlistSchema
    }, (input) => `${input.kind}s`), entities);

    const deNormalizedQueue = denormalize(player.queue.map(p => ({ id: p.id, schema: "tracks" })), new schema.Array({
        tracks: trackSchema
    }, (input) => `${input.kind}s`), entities);

    return {
        userPlayerlists: deNormalizedPlaylists,
        queue: deNormalizedQueue,
        auth,
        player,
        app,
        entities,
        showQueue: ui.showQueue,
        toasts: ui.toasts,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    addToast,
    clearToasts,
    initApp,
    playTrack,
    removeToast,
    setDimensions,
    toggleOffline,
    toggleQueue,
    updateQueue
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
