import { StoreState } from '@common/store';
import { Utils } from '@common/utils/utils';
import Settings from '@renderer/pages/settings/Settings';
import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { compose } from 'redux';
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
  const { app } = state;
  return {
    offline: app.offline,
    loaded: app.loaded
  };
};

type PropsFromState = ReturnType<typeof mapStateToProps>;

type AllProps = PropsFromState & RouteComponentProps;

const Main: FC<AllProps> = ({ loaded, offline, location: { search } }) => {
  const handleResolve = () => {
    const url = search.replace('?', '');

    if (!url || (url && !url.length)) {
      return <Redirect to="/" />;
    }

    Utils.resolveUrl(url);

    return <Spinner contained />;
  };

  if (!loaded && offline) {
    return <IsOffline full />;
  }

  if (!loaded) {
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

export default compose(withRouter, connect(mapStateToProps))(Main);
