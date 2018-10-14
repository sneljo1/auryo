import * as React from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { StoreState } from '../../../common/store';
import ArtistPage from '../artist/ArtistPage';
import ChartsDetailsPage from '../charts/ChartsDetailsPage';
import ChartsPage from '../charts/ChartsPage';
import PlaylistPage from '../playlist/PlaylistPage';
import FeedPlaylistPage from '../playlists/FeedPlaylistPage';
import LikesPlaylistPage from '../playlists/LikesPlaylistPage';
import MyPlaylistsPage from '../playlists/MyPlaylistsPage';
import MyTracksPage from '../playlists/MyTracksPage';
import SearchCategoryPage from '../search/Category/SearchCategoryPage';
import SearchPage from '../search/SearchPage';
import TrackPage from '../track/TrackPage';
import IsOffline from './components/Offline/Offline';
import Layout from './Layout';
import TagsPage from '../tags/TagsPage';

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
                    <Route path='/charts/genre/:genre' component={ChartsDetailsPage} />
                    <Route path='/charts/:type?' component={ChartsPage} />
                    <Route path='/likes' component={LikesPlaylistPage} />
                    <Route path='/mytracks' component={MyTracksPage} />
                    <Route path='/myplaylists' component={MyPlaylistsPage} />
                    <Route path='/track/:songId' component={TrackPage} />
                    <Route path='/user/:artistId' component={ArtistPage} />
                    <Route path='/playlist/:playlistId' component={PlaylistPage} />
                    <Route exact={true} path='/search' component={SearchPage} />
                    <Route path='/search/:category' component={SearchCategoryPage} />
                    <Route path='/tags/:tag/:type?' component={TagsPage} />
                </Switch>
            </Layout>
        );
    }
}

const mapStateToProps = ({ app }: StoreState): PropsFromState => ({ offline: app.offline, loaded: app.loaded });

export default withRouter(connect(mapStateToProps)(App));
