import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cn from 'classnames'
import PlayerContainer from '../player/Player'
import IsOffline from './components/Offline/Offline'
import SideBar from './components/Sidebar/Sidebar'
import Spinner from '../_shared/Spinner/Spinner'
import * as actions from '../../../shared/actions'
import ReduxToastr from 'react-redux-toastr'
import { hashHistory, Route, Switch, withRouter } from 'react-router'
import Queue from './components/Queue/Queue'
import { OBJECT_TYPES } from '../../../shared/constants/global'
import AddToPlaylistModal from '../_shared/AddToPlaylistModal/AddToPlaylistModal'
import ResizeAware from 'react-resize-aware'
import debounce from 'lodash/debounce'
import { denormalize, schema } from 'normalizr'
import playlistSchema from '../../../shared/schemas/playlist'
import AppError from './components/AppError/AppError'
import FeedPlaylistPage from '../playlists/FeedPlaylistPage'
import LikesPlaylistPage from '../playlists/LikesPlaylistPage'
import MyTracksPage from '../playlists/MyTracksPage'
import MyPlaylistsPage from '../playlists/MyPlaylistsPage'
import TrackPage from '../track/TrackPage'
import ArtistPage from '../artist/ArtistPage'
import PlaylistPage from '../playlist/PlaylistPage'
import SearchWrapper from '../search/SearchWrapper'
import UtilitiesModal from '../UtilitiesModel/UtilitiesModal'
import trackSchema from '../../../shared/schemas/track'
import ChartsPage from '../charts/ChartsPage'
import ChartsDetailsPage from '../charts/ChartsDetailsPage'
import { actions as toastrActions } from 'react-redux-toastr'

class App extends React.Component {

    constructor() {
        super()

        this.debouncedHandleResize = debounce(this.handleResize, 500)
    }

    componentDidMount() {
        this.props.initApp()

        window.addEventListener('online', this.setOnlineStatus)
        window.addEventListener('offline', this.setOnlineStatus)

    }

    componentWillReceiveProps(nextProps) {
        const { app, add,remove } = this.props

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
        this.props.cleanApp()

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

    handleResize = ({ width, height }) => {

        this.props.setDimensions({
            height,
            width
        })
    }

    render() {
        const {
            // Vars
            auth,
            app,
            playlists_ent,
            logout,
            push,
            replace,
            ui,
            player,
            track_entities,
            toggleQueue,
            scrollTop,

            // Functions
            playTrack,
            togglePlaylistTrack,
            playlists_objs,
            toggleLike,
            toggleRepost,
            show,
            addUpNext,
            updateQueue,
            entities,
            initApp
        } = this.props

        const { me, playlists, likes, reposts } = auth


        const p = denormalize({ playlists }, { playlists: [playlistSchema] }, entities)

        const deNormalizedQueue = denormalize(player.queue, new schema.Array(trackSchema), entities)

        return (
            <ResizeAware
                onlyEvent
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

                    <AddToPlaylistModal playlist_entities={playlists_ent}
                        playlist_objects={playlists_objs}
                        playlists={playlists}
                        togglePlaylistTrackFunc={togglePlaylistTrack}
                        track_entities={track_entities} />

                    <UtilitiesModal authenticated />
                </div>
            </ResizeAware>
        )
    }
}

App.propTypes = {
    playlists_ids: PropTypes.array,
    playlists_ent: PropTypes.object,
    me: PropTypes.object,

    initApp: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    toggleOffline: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired
}

App.defaultProps = {
    playlists_ids: [],
    playlists_ent: {}
}

const mapStateToProps = (state, props) => {
    const { auth, app, objects, player, entities: { playlist_entities, track_entities, user_entities }, ui } = state
    const { location } = props

    return {
        auth,
        player,
        app,
        playlists_ent: playlist_entities,
        entities: state.entities,
        ui,
        track_entities,
        user_entities,
        playlists_objs: objects[OBJECT_TYPES.PLAYLISTS] || {},
        scrollTop: ui.scrollPosition[location.pathname]
    }
}

export default withRouter(connect(mapStateToProps, { ...actions, ...toastrActions })(App))
