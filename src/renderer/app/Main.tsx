import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import Settings from '@renderer/pages/settings/Settings';
import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { bindActionCreators, compose, Dispatch } from 'redux';
import ArtistPage from '../pages/artist/ArtistPage';
import { ChartsDetailsPage } from '../pages/charts/ChartsDetailsPage';
import { ChartsPage } from '../pages/charts/ChartsPage';
import ForYouPage from '../pages/foryou/ForYouPage';
import PersonalizedPlaylistPage from '../pages/personalizedPlaylist/PersonalizedPlaylistPage';
import PlaylistPage from '../pages/playlist/PlaylistPage';
import FeedPlaylistPage from '../pages/playlists/FeedPlaylistPage';
import LikesPlaylistPage from '../pages/playlists/LikesPlaylistPage';
import MyPlaylistsPage from '../pages/playlists/MyPlaylistsPage';
import MyTracksPage from '../pages/playlists/MyTracksPage';
import SearchPage from '../pages/search/SearchPage';
import TagsPage from '../pages/tags/TagsPage';
import TrackPage from '../pages/track/TrackPage';
import Spinner from '../_shared/Spinner/Spinner';
import Header from './components/Header/Header';
import IsOffline from './components/Offline/Offline';
import Layout from './Layout';

const mapStateToProps = (state: StoreState) => {
  const { app, config } = state;
  return {
    offline: app.offline,
    appHasError: app.error,
    loaded: app.loaded,
    token: config.auth.token
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      initApp: actions.initApp,
      resolveUrl: actions.resolveUrl
    },
    dispatch
  );

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = PropsFromState & RouteComponentProps & PropsFromDispatch;

const Main: FC<AllProps> = ({ loaded, offline, appHasError, location: { search }, token, initApp, resolveUrl }) => {
  const handleResolve = () => {
    const url = search.replace('?', '');

    if (!url || (url && !url.length)) {
      return <Redirect to="/" />;
    }

    resolveUrl(url);

    return <Spinner contained />;
  };

  useEffect(() => {
    if (token) {
      initApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return <Redirect to="/login" />;
  }

  if (!loaded && offline) {
    return <IsOffline full />;
  }

  if (!loaded && !appHasError) {
    return <Spinner full />;
  }

  return (
    <Layout>
      {({ scrollTop }: any) => (
        <>
          <Header scrollTop={scrollTop} />
          <Switch>
            <Route exact path="/" component={FeedPlaylistPage} />
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
            <Route exact path="/search/:category?" component={SearchPage} />
            <Route path="/tags/:tag/:type?" component={TagsPage} />
            <Route path="/resolve" render={handleResolve} />
          </Switch>
        </>
      )}
    </Layout>
  );
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Main);
