import { PlaylistTypes } from '@common/store/objects';
import { OfflineCheckRoute } from '@renderer/app/components/OfflineCheckRoute';
import { GenericPlaylist } from '@renderer/pages/GenericPlaylist';
import { Settings } from '@renderer/pages/settings/Settings';
import React, { FC, useCallback } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { ArtistPage } from '../pages/artist/ArtistPage';
import { ChartsDetailsPage } from '../pages/charts/ChartsDetailsPage';
import { ChartsPage } from '../pages/charts/ChartsPage';
import ForYouPage from '../pages/foryou/ForYouPage';
import PlaylistPage from '../pages/playlist/PlaylistPage';
import { SearchPage } from '../pages/search/SearchPage';
import { TagsPage } from '../pages/tags/TagsPage';
import { TrackPage } from '../pages/track/TrackPage';
import { Header } from './components/Header/Header';
import { Layout } from './Layout';

type Props = RouteComponentProps;

const Main: FC<Props> = () => {
  const renderGenericPlaylist = useCallback(
    (options: { title: string; playlistType: PlaylistTypes; showInfo?: boolean }) => () => (
      <GenericPlaylist
        key={options.title}
        title={options.title}
        showInfo={options.showInfo}
        playlistType={options.playlistType}
      />
    ),
    []
  );

  const StreamPlaylist = renderGenericPlaylist({
    title: 'Stream',
    playlistType: PlaylistTypes.STREAM,
    showInfo: true
  });

  const LikesPlaylist = renderGenericPlaylist({
    title: 'Likes',
    playlistType: PlaylistTypes.LIKES
  });

  const MyTracksPlaylist = renderGenericPlaylist({
    title: 'Tracks',
    playlistType: PlaylistTypes.MYTRACKS
  });

  const MyPlaylists = renderGenericPlaylist({
    title: 'Playlists',
    playlistType: PlaylistTypes.MYPLAYLISTS
  });

  return (
    <Layout>
      <>
        <Header />
        <Switch>
          <OfflineCheckRoute exact path="/" component={StreamPlaylist} />
          <OfflineCheckRoute path="/charts/genre/:genre" component={ChartsDetailsPage} />
          <OfflineCheckRoute path="/charts/:type?" component={ChartsPage} />
          <OfflineCheckRoute path="/likes" component={LikesPlaylist} />
          <OfflineCheckRoute path="/mytracks" component={MyTracksPlaylist} />
          <Route path="/settings" component={Settings} />
          <OfflineCheckRoute path="/foryou" component={ForYouPage} />
          <OfflineCheckRoute path="/myplaylists" component={MyPlaylists} />
          <OfflineCheckRoute path="/track/:songId" component={TrackPage} />
          <OfflineCheckRoute path="/user/:artistId" component={ArtistPage} />
          <OfflineCheckRoute path="/playlist/:playlistId" component={PlaylistPage} />
          <OfflineCheckRoute exact path="/search/:playlistType?" component={SearchPage} />
          <OfflineCheckRoute path="/tags/:tag" component={TagsPage} />
        </Switch>
      </>
    </Layout>
  );
};

export default Main;
