import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { addUpNext, getTrack } from '@common/store/actions';
import { getNormalizedTrack, getNormalizedUser, isTrackError, isTrackLoading } from '@common/store/selectors';
import { LikeType, PlaylistTypes, RepostType } from '@common/store/types';
import { SC } from '@common/utils';
import { IPC } from '@common/utils/ipc';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import { ToggleLikeButton } from '@renderer/_shared/PageHeader/components/ToggleLikeButton';
import { ToggleRepostButton } from '@renderer/_shared/PageHeader/components/ToggleRepostButton';
import cn from 'classnames';
import _ from 'lodash';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import FallbackImage from '../../_shared/FallbackImage';
import { TogglePlayButton } from '../../_shared/PageHeader/components/TogglePlayButton';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import { PlaylistTrackList } from '../../_shared/PlaylistTrackList';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import { TrackOverview } from './components/TrackOverview';
import './TrackPage.scss';

enum TabTypes {
  OVERVIEW = 'overview',
  RELATED_TRACKS = 'related'
}

type Props = RouteComponentProps<{ songId: string }>;

export const TrackPage: FC<Props> = ({
  match: {
    params: { songId }
  }
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<TabTypes>(TabTypes.OVERVIEW);

  const loading = useSelector(isTrackLoading(songId));
  const error = useSelector(isTrackError(songId));
  const track = useSelector(getNormalizedTrack(songId));
  const user = useSelector(getNormalizedUser(track?.user));

  const relatedTrackId = useMemo(() => ({ objectId: songId, playlistType: PlaylistTypes.RELATED }), [songId]);

  // Fetch track if it does not exist yet
  useEffect(() => {
    if (!track && !loading) {
      dispatch(getTrack.request({ refresh: true, trackId: +songId }));
    }
  }, [loading, track, error, songId, dispatch]);

  if (loading && !error && !track) {
    return <Spinner contained />;
  }

  if (error || !track) {
    // TODO; how will we handle errors
    return null;
  }

  const image = SC.getImageUrl({ ...track, user }, IMAGE_SIZES.LARGE);

  const purchaseTitle = track.purchase_title || 'Download';

  return (
    <>
      <SetLayoutSettings hasImage={!!image} />

      <PageHeader image={image}>
        <Row className="trackHeader">
          {image && (
            <Col xs="12" md="4" xl="3">
              <div className="imageWrapper">
                <FallbackImage src={image} />
              </div>
            </Col>
          )}

          <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
            <h2>{track.title}</h2>

            <div className="button-group">
              {SC.isStreamable(track) ? (
                <TogglePlayButton colored playlistID={relatedTrackId} />
              ) : (
                <a href="javascript:void(0)" className="disabled c_btn">
                  <span>This track is not streamable</span>
                </a>
              )}

              <ToggleLikeButton id={track.id} type={LikeType.Track} />

              <ToggleRepostButton id={track.id} type={RepostType.Track} />

              {!track.purchase_url && track.download_url && track.downloadable && (
                <a
                  href="javascript:void(0)"
                  className="c_btn round"
                  onClick={() => {
                    IPC.downloadFile(SC.appendClientId(track.download_url));
                  }}>
                  <i className="bx bxs-download-alt" />
                </a>
              )}

              <Popover
                autoFocus={false}
                minimal
                position={Position.BOTTOM_LEFT}
                content={
                  <Menu>
                    {track.purchase_url && (
                      <>
                        {track.purchase_url && (
                          <MenuItem
                            icon="link"
                            text={purchaseTitle}
                            onClick={() => {
                              IPC.openExternal(track.purchase_url);
                            }}
                          />
                        )}

                        <MenuDivider />
                      </>
                    )}

                    <MenuItem
                      text="Add to queue"
                      onClick={() => {
                        dispatch(addUpNext.request({ id: +songId, schema: 'tracks' }));
                      }}
                    />

                    <MenuDivider />

                    <MenuItem
                      text="View in browser"
                      onClick={() => {
                        IPC.openExternal(track.permalink_url);
                      }}
                    />

                    <ShareMenuItem
                      title={track.title}
                      permalink={track.permalink_url}
                      username={_.get(track, 'user.username', '')}
                    />
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
            className={cn({ active: activeTab === TabTypes.OVERVIEW })}
            onClick={() => setActiveTab(TabTypes.OVERVIEW)}>
            Overview
          </a>

          <a
            href="javascript:void(0)"
            className={cn({
              active: activeTab === TabTypes.RELATED_TRACKS
            })}
            onClick={() => setActiveTab(TabTypes.RELATED_TRACKS)}>
            Related tracks
          </a>
        </div>
      </PageHeader>

      <div className="trackDetails container-fluid main_track_content detailPage">
        <TabContent activeTab={activeTab}>
          {/* OVERVIEW */}
          <TabPane tabId={TabTypes.OVERVIEW} className="overview">
            <TrackOverview track={track} />
          </TabPane>

          {/* RELATED TRACKS */}
          <TabPane tabId={TabTypes.RELATED_TRACKS} className="trackPadding-side">
            <PlaylistTrackList id={relatedTrackId} />
          </TabPane>
        </TabContent>
      </div>
    </>
  );
};
