import { StoreState } from "@common/store";
import { initApp } from "@common/store/app";
import { getScrollPositions } from "@common/store/ui/selectors";
import { Utils } from "@common/utils/utils";
import Settings from "@renderer/pages/settings/Settings";
import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { bindActionCreators, compose, Dispatch } from "redux";
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
import SearchPage from "../pages/search/SearchPage";
import TagsPage from "../pages/tags/TagsPage";
import TrackPage from "../pages/track/TrackPage";
import Header from "./components/Header/Header";
import IsOffline from "./components/Offline/Offline";
import Layout from "./Layout";

interface State {
    previousScrollTop?: number;
    isScrolling: boolean;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = PropsFromState & RouteComponentProps & PropsFromDispatch;

@autobind
class App extends React.PureComponent<AllProps, State> {

    public componentDidMount() {

        const { initApp } = this.props;

        initApp();
    }

    public handleResolve(props: RouteComponentProps<any>) {
        const { location: { search } } = props;

        const url = search.replace("?", "");

        if (!url || (url && !url.length)) {
            return <Redirect to="/" />;
        }

        Utils.resolveUrl(url);

        return <Spinner contained={true} />;
    }

    public render() {
        const { loaded, offline, location: { pathname }, scrollPositions } = this.props;

        if (!loaded && offline) {
            return <IsOffline full={true} />;
        }

        if (!loaded) {
            return <Spinner full={true} />;
        }

        const scrollTop = scrollPositions[pathname] || 0;

        return (
            <Layout>
                <Header
                    scrollTop={scrollTop}
                />
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
                    <Route exact={true} path="/search/:category?" component={SearchPage} />
                    <Route path="/tags/:tag/:type?" component={TagsPage} />
                    <Route path="/resolve" render={this.handleResolve} />
                </Switch>
            </Layout>
        );
    }
}

const mapStateToProps = (state: StoreState) => {
    const { app } = state;

    return {
        offline: app.offline,
        loaded: app.loaded,
        scrollPositions: getScrollPositions(state)
    }
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    initApp,
}, dispatch);

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps)
)(App);
