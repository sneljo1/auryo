import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { getUser, openExternalUrl } from '@common/store/actions';
import { PlaylistTypes } from '@common/store/objects';
import { currentUserSelector, getNormalizedUserForPage, isUserError, isUserLoading } from '@common/store/selectors';
import { abbreviateNumber, SC } from '@common/utils';
import { IPC } from '@common/utils/ipc';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import { ToggleFollowButton } from '@renderer/_shared/PageHeader/components/ToggleFollowButton';
import { PlaylistTrackList } from '@renderer/_shared/PlaylistTrackList';
import cn from 'classnames';
import { stopForwarding } from 'electron-redux';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import FallbackImage from '../../_shared/FallbackImage';
import { Linkify } from '../../_shared/Linkify';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import { ToggleMore } from '../../_shared/ToggleMore';
import './ArtistPage.scss';
import { ArtistProfiles } from './components/ArtistProfiles/ArtistProfiles';

type Props = RouteComponentProps<{ artistId: string }>;

enum TabTypes {
  TRACKS = 'tracks',
  LIKES = 'likes',
  INFO = 'info',
  TOP_TRACKS = 'TOP_TRACKS'
}

export const ArtistPage: FC<Props> = ({
  match: {
    params: { artistId }
  }
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(isUserLoading(artistId));
  const error = useSelector(isUserError(artistId));

  const artist = useSelector(getNormalizedUserForPage(artistId));
  const currentUser = useSelector(currentUserSelector);

  const [activeTab, setActiveTab] = useState<TabTypes>(TabTypes.TRACKS);

  const renderInfo = useCallback(
    (toggleMore = false) => {
      if (!artist) {
        return null;
      }

      return (
        <>
          <ul className="artistStats d-flex">
            <li>
              <span>{abbreviateNumber(artist.followers_count)}</span>
              <span>Followers</span>
            </li>
            <li>
              <span>{abbreviateNumber(artist.followings_count)}</span>
              <span>Following</span>
            </li>
            <li>
              <span>{abbreviateNumber(artist.track_count)}</span>
              <span>Tracks</span>
            </li>
          </ul>
          {toggleMore ? (
            <ToggleMore>
              <div className="artistInfo">
                <Linkify text={artist.description} />
              </div>
            </ToggleMore>
          ) : (
            <div className="artistInfo p-1  pt-5">
              <Linkify text={artist.description} />
            </div>
          )}

          <ArtistProfiles className="pt-1" userId={artistId} />
        </>
      );
    },
    [artist, artistId]
  );

  const artistTracksId = useMemo(() => ({ objectId: artistId, playlistType: PlaylistTypes.ARTIST_TRACKS }), [artistId]);
  const artistTopTracksId = useMemo(() => ({ objectId: artistId, playlistType: PlaylistTypes.ARTIST_TOP_TRACKS }), [
    artistId
  ]);
  const artistLikesId = useMemo(() => ({ objectId: artistId, playlistType: PlaylistTypes.ARTIST_LIKES }), [artistId]);

  // Reset tabs
  useEffect(() => {
    setActiveTab(TabTypes.TRACKS);
  }, [artistId]);

  // Fetch user if it does not exist yet
  useEffect(() => {
    if (!artist && !loading) {
      dispatch(stopForwarding(getUser.request({ refresh: true, userId: +artistId })));
    }
  }, [loading, artist, error, artistId, dispatch]);

  if (loading && !error && !artist) {
    return <Spinner contained />;
  }

  if (error || !artist) {
    // TODO; how will we handle errors
    return null;
  }

  const userImg = SC.getImageUrl(artist.avatar_url, IMAGE_SIZES.LARGE);

  return (
    <>
      <SetLayoutSettings hasImage={!!userImg} />

      <PageHeader image={userImg}>
        <Row className="trackHeader">
          <Col xs="12" md="4" xl="3">
            <div className="imageWrapper">
              <FallbackImage src={userImg} />
            </div>
          </Col>

          <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
            <h2>{artist.username}</h2>
            <h3 className="trackArtist">
              {artist.city}
              {artist.city && artist.country ? ' , ' : null}
              {artist.country}
            </h3>
            <div className="button-group">
              {currentUser && +artistId !== currentUser.id ? <ToggleFollowButton userId={artistId} /> : null}

              <Popover
                autoFocus={false}
                minimal
                position={Position.BOTTOM_LEFT}
                content={
                  <Menu>
                    <MenuItem
                      text="View in browser"
                      onClick={() => {
                        dispatch(openExternalUrl(artist.permalink_url));
                      }}
                    />
                    <ShareMenuItem username={artist.username} permalink={artist.permalink_url} />
                  </Menu>
                }>
                <a href="javascript:void(0)" className="c_btn round">
                  <i className="bx bx-dots-horizontal-rounded" />
                </a>
              </Popover>
            </div>
          </Col>
        </Row>

        <div className="flex tracktabs row">
          <a
            href="javascript:void(0)"
            className={cn({ active: activeTab === TabTypes.TRACKS })}
            onClick={() => {
              setActiveTab(TabTypes.TRACKS);
            }}>
            <span className="text">Tracks</span>
          </a>
          <a
            href="javascript:void(0)"
            className={cn({ active: activeTab === TabTypes.TOP_TRACKS })}
            onClick={() => {
              setActiveTab(TabTypes.TOP_TRACKS);
            }}>
            <span className="text">Top Tracks</span>
          </a>
          <a
            href="javascript:void(0)"
            className={cn({ active: activeTab === TabTypes.LIKES })}
            onClick={() => {
              setActiveTab(TabTypes.LIKES);
            }}>
            <span className="text">Likes</span>
          </a>
        </div>
      </PageHeader>
      <div className="artistPage container-fluid detailPage">
        <Row className="main_track_content">
          <Col xs="12" lg="8">
            <TabContent activeTab={activeTab} className="px-1">
              {/* Tracks */}
              <TabPane tabId={TabTypes.TRACKS}>
                {activeTab === TabTypes.TRACKS && <PlaylistTrackList playlistID={artistTracksId} />}
              </TabPane>

              {/* Tracks */}
              <TabPane tabId={TabTypes.TOP_TRACKS}>
                {activeTab === TabTypes.TOP_TRACKS && <PlaylistTrackList playlistID={artistTopTracksId} />}
              </TabPane>

              {/* Likes */}
              <TabPane tabId={TabTypes.LIKES}>
                {activeTab === TabTypes.LIKES && <PlaylistTrackList playlistID={artistLikesId} />}
              </TabPane>
            </TabContent>
          </Col>
          <Col xs="4" className="artistSide">
            {renderInfo(true)}
          </Col>
        </Row>
      </div>
    </>
  );
};
