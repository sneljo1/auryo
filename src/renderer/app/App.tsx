import * as React from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter, StaticContext, Redirect } from 'react-router';
import { StoreState } from '../../common/store';
import IsOffline from './components/Offline/Offline';
import Layout from './Layout';
import { Utils } from '../../common/utils/utils';
import Spinner from '../_shared/Spinner/Spinner';
import FeedPlaylistPage from '../pages/playlists/FeedPlaylistPage';
import ChartsDetailsPage from '../pages/charts/ChartsDetailsPage';
import ChartsPage from '../pages/charts/ChartsPage';
import LikesPlaylistPage from '../pages/playlists/LikesPlaylistPage';
import MyTracksPage from '../pages/playlists/MyTracksPage';
import MyPlaylistsPage from '../pages/playlists/MyPlaylistsPage';
import TrackPage from '../pages/track/TrackPage';
import ArtistPage from '../pages/artist/ArtistPage';
import PlaylistPage from '../pages/playlist/PlaylistPage';
import SearchPage from '../pages/search/SearchPage';
import SearchCategoryPage from '../pages/search/Category/SearchCategoryPage';
import TagsPage from '../pages/tags/TagsPage';
import ForYouPage from '../pages/foryou/ForYouPage';
import PersonalizedPlaylistPage from '../pages/personalizedPlaylist/PersonalizedPlaylistPage';

interface PropsFromState {
    offline: boolean;
    loaded: boolean;
}

type AllProps = PropsFromState & RouteComponentProps<{}>;

class App extends React.PureComponent<AllProps> {

    handleResolve = (props: RouteComponentProps<any, StaticContext>) => {
        const { location: { search } } = props;

        const url = search.replace('?', '');

        if (!url || (url && !url.length)) {
            return <Redirect to='/' />;
        }

        Utils.resolveUrl(url);

        return <Spinner contained={true} />;
    }

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
                    <Route path='/foryou' component={ForYouPage} />
                    <Route path='/myplaylists' component={MyPlaylistsPage} />
                    <Route path='/track/:songId' component={TrackPage} />
                    <Route path='/user/:artistId' component={ArtistPage} />
                    <Route path='/playlist/:playlistId' component={PlaylistPage} />
                    <Route path='/personalized/:playlistId' component={PersonalizedPlaylistPage} />
                    <Route exact={true} path='/search' component={SearchPage} />
                    <Route path='/search/:category' component={SearchCategoryPage} />
                    <Route path='/tags/:tag/:type?' component={TagsPage} />
                    <Route path='/resolve' render={this.handleResolve} />
                </Switch>
            </Layout>
        );
    }
}

const mapStateToProps = ({ app }: StoreState): PropsFromState => ({ offline: app.offline, loaded: app.loaded });

export default withRouter(connect(mapStateToProps)(App));
