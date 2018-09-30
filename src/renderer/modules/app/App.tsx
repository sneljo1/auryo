import React from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { StoreState } from '../../../shared/store';
import ArtistPage from '../artist/ArtistPage';
import ChartsDetailsPage from '../charts/ChartsDetailsPage';
import ChartsPage from '../charts/ChartsPage';
import PlaylistPage from '../playlist/PlaylistPage';
import FeedPlaylistPage from '../playlists/FeedPlaylistPage';
import LikesPlaylistPage from '../playlists/LikesPlaylistPage';
import MyPlaylistsPage from '../playlists/MyPlaylistsPage';
import MyTracksPage from '../playlists/MyTracksPage';
import SearchWrapper from '../search/SearchWrapper';
import TrackPage from '../track/TrackPage';
import IsOffline from './components/Offline/Offline';
import Layout from './Layout';

interface PropsFromState {
    offline: boolean;
    loaded: boolean;
}

type AllProps = PropsFromState & RouteComponentProps<{}>;

class App extends React.Component<AllProps> {
    render() {
        const { loaded, offline } = this.props;

        if (!loaded && offline) {
            return <IsOffline full={true} />;
        }

        return (
            <Layout>
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
            </Layout>
        );
    }
}

const mapStateToProps = ({ app }: StoreState): PropsFromState => ({ offline: app.offline, loaded: app.loaded });

export default withRouter(connect(mapStateToProps)(App));
