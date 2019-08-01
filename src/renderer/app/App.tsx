import { StoreState } from "@common/store";
import { Utils } from "@common/utils/utils";
import Settings from "@renderer/pages/settings/Settings";
import * as React from "react";
import { connect } from "react-redux";
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from "react-router";
import Spinner from "../_shared/Spinner/Spinner";
import ArtistPage from "../pages/artist/ArtistPage";
import ChartsDetailsPage from "../pages/charts/ChartsDetailsPage";
import ChartsPage from "../pages/charts/ChartsPage";
import ForYouPage from "../pages/foryou/ForYouPage";
import PersonalizedPlaylistPage from "../pages/personalizedPlaylist/PersonalizedPlaylistPage";
import PlaylistPage from "../pages/playlist/PlaylistPage";
import FeedPlaylistPage from "../pages/playlists/FeedPlaylistPage";
import LikesPlaylistPage from "../pages/playlists/LikesPlaylistPage";
import MyPlaylistsPage from "../pages/playlists/MyPlaylistsPage";
import MyTracksPage from "../pages/playlists/MyTracksPage";
import SearchCategoryPage from "../pages/search/Category/SearchCategoryPage";
import SearchPage from "../pages/search/SearchPage";
import TagsPage from "../pages/tags/TagsPage";
import TrackPage from "../pages/track/TrackPage";
import IsOffline from "./components/Offline/Offline";
import Layout from "./Layout";

interface PropsFromState {
    offline: boolean;
    loaded: boolean;
}

type AllProps = PropsFromState & RouteComponentProps;

class App extends React.PureComponent<AllProps> {

    public handleResolve = (props: RouteComponentProps<any>) => {
        const { location: { search } } = props;

        const url = search.replace("?", "");

        if (!url || (url && !url.length)) {
            return <Redirect to="/" />;
        }

        Utils.resolveUrl(url);

        return <Spinner contained={true} />;
    }

    public render() {
        const { loaded, offline } = this.props;

        if (!loaded && offline) {
            return <IsOffline full={true} />;
        }

        return (
            <Layout>
                <Switch>
                    <Route exact={true} path="/" component={FeedPlaylistPage} />
                    <Route path="/charts/genre/:genre" component={ChartsDetailsPage} />
                    <Route path="/charts/:type?" component={ChartsPage} />
                    <Route path="/likes" component={LikesPlaylistPage} />
                    <Route path="/mytracks" component={MyTracksPage} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/foryou" component={ForYouPage} />
                    <Route path="/myplaylists" component={MyPlaylistsPage} />
                    <Route path="/track/:songId" component={TrackPage} />
                    <Route path="/user/:artistId" component={ArtistPage} />
                    <Route path="/playlist/:playlistId" component={PlaylistPage} />
                    <Route path="/personalized/:playlistId" component={PersonalizedPlaylistPage} />
                    <Route exact={true} path="/search" component={SearchPage} />
                    <Route path="/search/:category" component={SearchCategoryPage} />
                    <Route path="/tags/:tag/:type?" component={TagsPage} />
                    <Route path="/resolve" render={this.handleResolve} />
                </Switch>
            </Layout>
        );
    }
}

const mapStateToProps = ({ app }: StoreState): PropsFromState => ({ offline: app.offline, loaded: app.loaded });

export default withRouter(connect(mapStateToProps)(App));
