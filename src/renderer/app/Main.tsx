import * as actions from '@common/store/actions';
import { PlaylistTypes } from '@common/store/objects';
import { GenericPlaylist } from '@renderer/pages/GenericPlaylist';
import Settings from '@renderer/pages/settings/Settings';
import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { ArtistPage } from '../pages/artist/ArtistPage';
import { ChartsDetailsPage } from '../pages/charts/ChartsDetailsPage';
import { ChartsPage } from '../pages/charts/ChartsPage';
import ForYouPage from '../pages/foryou/ForYouPage';
import PlaylistPage from '../pages/playlist/PlaylistPage';
import { SearchPage } from '../pages/search/SearchPage';
import { TagsPage } from '../pages/tags/TagsPage';
import { TrackPage } from '../pages/track/TrackPage';
import Spinner from '../_shared/Spinner/Spinner';
import Header from './components/Header/Header';
import Layout from './Layout';

type Props = RouteComponentProps;

const Main: FC<Props> = ({ location: { search } }) => {
  const dispatch = useDispatch();

  const handleResolve = useCallback(() => {
    const url = search.replace('?', '');

    if (!url || (url && !url.length)) {
      return <Redirect to="/" />;
    }

    dispatch(actions.resolveUrl(url));

    return <Spinner contained />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // return (
  //   <button style={{ margin: 90 }} onClick={() => logout()}>
  //     Logout
  //   </button>
  // );

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
      {({ scrollTop }: any) => (
        <>
          <Header scrollTop={scrollTop} />
          <Switch>
            <Route exact path="/" component={StreamPlaylist} />
            <Route path="/charts/genre/:genre" component={ChartsDetailsPage} />
            <Route path="/charts/:type?" component={ChartsPage} />
            <Route path="/likes" component={LikesPlaylist} />
            <Route path="/mytracks" component={MyTracksPlaylist} />
            <Route path="/settings" component={Settings} />
            <Route path="/foryou" component={ForYouPage} />
            <Route path="/myplaylists" component={MyPlaylists} />
            <Route path="/track/:songId" component={TrackPage} />
            <Route path="/user/:artistId" component={ArtistPage} />
            <Route path="/playlist/:playlistId" component={PlaylistPage} />
            <Route exact path="/search/:playlistType?" component={SearchPage} />
            <Route path="/tags/:tag/:playlistType?" component={TagsPage} />
            <Route path="/resolve" render={handleResolve} />
          </Switch>
        </>
      )}
    </Layout>
  );
};

export default Main;
