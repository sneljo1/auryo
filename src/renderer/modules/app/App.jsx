import { ResizeSensor } from '@blueprintjs/core';
import cn from 'classnames';
import debounce from 'lodash/debounce';
import { denormalize, schema } from 'normalizr';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ReduxToastr, { actions as toastrActions } from 'react-redux-toastr';
import { Route, Switch, withRouter } from 'react-router';
import * as actions from '../../../shared/actions';
import { OBJECT_TYPES } from '../../../shared/constants/global';
import playlistSchema from '../../../shared/schemas/playlist';
import trackSchema from '../../../shared/schemas/track';
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
import UtilitiesModal from '../UtilitiesModel/UtilitiesModal';
import AddToPlaylistModal from '../_shared/AddToPlaylistModal/AddToPlaylistModal';
import Spinner from '../_shared/Spinner/Spinner';
import AppError from './components/AppError/AppError';
import IsOffline from './components/Offline/Offline';
import Queue from './components/Queue/Queue';
import SideBar from './components/Sidebar/Sidebar';
import ChangelogModal from './components/modals/ChangeLogModal/ChangelogModal';

class App extends React.Component {

    constructor() {
        super()

        this.debouncedHandleResize = debounce(this.handleResize, 500, { leading: true })
    }

    componentDidMount() {
        const { initApp } = this.props;

        initApp()

        window.addEventListener('online', this.setOnlineStatus)
        window.addEventListener('offline', this.setOnlineStatus)

    }

    componentWillReceiveProps(nextProps) {
        const { app, add, remove } = this.props

        if (app.offline !== nextProps.app.offline && nextProps.app.offline === true) {
            add({
                id: 'offline', // If not provided we will add one.
                timeOut: 0,
                type: 'info',
                showCloseButton: false,
                title: 'You are currently offline.',
                message: 'Please reconnect!'

            })
        } else if (app.offline !== nextProps.app.offline && nextProps.app.offline === false) {
            remove('offline')
        }
    }

    componentWillUnmount() {
        const { cleanApp } = this.props;

        cleanApp()

        window.removeEventListener('online', this.setOnlineStatus)
        window.removeEventListener('offline', this.setOnlineStatus)
    }

    setOnlineStatus = () => {
        const { toggleOffline } = this.props

        toggleOffline(!navigator.onLine)
    }

    renderMain = () => {
        const { app } = this.props

        if (!app.loaded && app.offline) {
            return <IsOffline full />
        }

        return (
            <div className="f-height">
                <Switch>
                    <Route exact path="/" component={FeedPlaylistPage} />
                    <Route exact path="/charts" component={ChartsPage} />
                    <Route path="/charts/:genre" component={ChartsDetailsPage} />
                    <Route path="/likes" component={LikesPlaylistPage} />
                    <Route path="/mytracks" component={MyTracksPage} />
                    <Route path="/myplaylists" component={MyPlaylistsPage} />
                    <Route path="/track/:songId" component={TrackPage} />
                    <Route path="/user/:artistId" component={ArtistPage} />
                    <Route path="/playlist/:playlistId" component={PlaylistPage} />
                    <Route path="/search/:query?" component={SearchWrapper} />
                </Switch>
            </div>
        )
    }

    handleResize = ([{ contentRect: { width, height } }]) => {

        const { setDimensions } = this.props;

        setDimensions({
            height,
            width
        })
    }

    render() {
        const {
            // Vars
            auth,
            app,
            entities,
            ui,
            player,
            playlists_objs,
            // Functions
            playTrack,
            togglePlaylistTrack,
            updateQueue,
            toggleQueue,
            initApp
        } = this.props

        const { playlist_entities, track_entities } = entities;
        const { playlists } = auth


        const p = denormalize({ playlists }, { playlists: [playlistSchema] }, entities)

        const deNormalizedQueue = denormalize(player.queue, new schema.Array(trackSchema), entities)

        return (
            <ResizeSensor
                onResize={this.debouncedHandleResize}
            >

                <div className={cn('body auryo', { development: !(process.env.NODE_ENV === 'production') })}>
                    {
                        !app.loaded && !app.offline && !app.loading_error ? <Spinner full /> : null
                    }

                    {
                        app.loading_error ? <AppError error={app.loading_error} initApp={initApp} /> : null
                    }

                    <main className={cn('d-flex flex-nowrap', {
                        playing: player.playingTrack.id !== null
                    })}>
                        <SideBar
                            playing={player.playingTrack.id !== null}
                            currentPlaylistId={player.currentPlaylistId}
                            playlists={p.playlists} />

                        <Queue
                            showQueue={ui.queue}
                            items={deNormalizedQueue}
                            player={player}

                            updateQueue={updateQueue}
                            toggleQueue={toggleQueue}
                            playTrack={playTrack} />

                        <section className="content">

                            <ReduxToastr
                                timeOut={4000}
                                newestOnTop={false}
                                preventDuplicates
                                position="top-right"
                                transitionIn="fadeIn"
                                transitionOut="fadeOut" />
                            {
                                this.renderMain()
                            }
                        </section>


                    </main>

                    <footer className='fixed-bottom player-container'>
                        <PlayerContainer />
                    </footer>

                    <AddToPlaylistModal playlist_entities={playlist_entities}
                        playlist_objects={playlists_objs}
                        playlists={playlists}
                        togglePlaylistTrackFunc={togglePlaylistTrack}
                        track_entities={track_entities} />

                    <UtilitiesModal authenticated />

                    <ChangelogModal />
                </div>
            </ResizeSensor>
        )
    }
}

App.propTypes = {
    entities: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    playlists_objs: PropTypes.object.isRequired,

    initApp: PropTypes.func.isRequired,
    toggleOffline: PropTypes.func.isRequired,
    cleanApp: PropTypes.func.isRequired,
    add: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    setDimensions: PropTypes.func.isRequired,
    toggleQueue: PropTypes.func.isRequired,
    updateQueue: PropTypes.func.isRequired,
    togglePlaylistTrack: PropTypes.func.isRequired,
    playTrack: PropTypes.func.isRequired
}

const mapStateToProps = (state, props) => {
    const { auth, app, objects, player, entities, ui } = state
    const { location } = props

    return {
        auth,
        player,
        app,
        entities,
        ui,
        playlists_objs: objects[OBJECT_TYPES.PLAYLISTS] || {},
        scrollTop: ui.scrollPosition[location.pathname]
    }
}

export default withRouter(connect(mapStateToProps, { ...actions, ...toastrActions })(App))
