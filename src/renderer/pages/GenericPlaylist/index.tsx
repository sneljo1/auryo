import { genericPlaylistFetchMore, getGenericPlaylist } from '@common/store/actions';
import { SortTypes } from '@common/store/playlist/types';
import { getPlaylistObjectSelector } from '@common/store/selectors';
import { PlaylistTypes } from '@common/store/types';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import { TogglePlayButton } from '@renderer/_shared/PageHeader/components/TogglePlayButton';
import { stopForwarding } from 'electron-redux';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

interface Props {
  playlistType: PlaylistTypes;
  objectId?: string;
  title: string;
  backgroundImage?: string;
  gradient?: string;
  sortType?: SortTypes;
  showInfo?: boolean;
  onSortTypeChange?(event: React.ChangeEvent<HTMLSelectElement>): void;
}

export const GenericPlaylist: FC<Props> = ({
  onSortTypeChange,
  sortType,
  playlistType,
  showInfo,
  title,
  backgroundImage,
  gradient,
  objectId
}) => {
  const dispatch = useDispatch();
  const isChart = playlistType === PlaylistTypes.CHART;
  const playlistID = useMemo(() => ({ objectId, playlistType }), [objectId, playlistType]);
  const playlistObject = useSelector(getPlaylistObjectSelector(playlistID));

  // Do initial fetch for playlist
  useEffect(() => {
    dispatch(
      stopForwarding(
        getGenericPlaylist.request({
          playlistType,
          // TODO: For the stream page, do not refresh automatically. Show a button to refresh instead
          refresh: playlistType !== PlaylistTypes.STREAM,
          sortType,
          objectId
        })
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]);

  const { loadMore } = useLoadMorePromise(
    playlistObject?.isFetching,
    () => {
      dispatch(stopForwarding(genericPlaylistFetchMore.request({ playlistType, objectId })));
    },
    [dispatch, playlistType]
  );

  const renderChartSort = useCallback(() => {
    return (
      <div className="float-right">
        <div className="bp3-select bp3-minimal">
          <select value={sortType} onBlur={onSortTypeChange} onChange={onSortTypeChange}>
            <option value={SortTypes.TOP}>{SortTypes.TOP}</option>
            <option value={SortTypes.TRENDING}>{SortTypes.TRENDING}</option>
          </select>
        </div>
      </div>
    );
  }, [onSortTypeChange, sortType]);

  const isEmpty = !playlistObject?.isFetching && playlistObject?.items?.length === 0;
  const hasItems = playlistObject?.items?.length;

  if (!playlistObject || (playlistObject && playlistObject.isFetching && !playlistObject.items.length)) {
    return <Spinner contained />;
  }

  return (
    <>
      <SetLayoutSettings hasImage={!!backgroundImage} />
      <PageHeader image={backgroundImage} gradient={gradient} title={title}>
        <>
          {isChart ? (
            renderChartSort()
          ) : (
            <div className="button-group">
              {!!hasItems && !isEmpty && <TogglePlayButton colored playlistID={playlistID} />}
            </div>
          )}
        </>
      </PageHeader>

      {playlistObject.error && (
        <div className="pt-5 mt-5">
          <h5 className="text-muted text-center">Something seems to have gone wrong fetching this playlist.</h5>
          <div className="text-center" style={{ fontSize: '5rem' }}>
            ⚠️
          </div>
        </div>
      )}

      {!playlistObject.items.length && !playlistObject.error ? (
        <div className="pt-5 mt-5">
          <h5 className="text-muted text-center">That's unfortunate, you don't seem to have any tracks in here</h5>
          <div className="text-center" style={{ fontSize: '5rem' }}>
            🧐
          </div>
        </div>
      ) : (
        <TracksGrid
          items={playlistObject.items}
          playlistID={{ playlistType, objectId }}
          showInfo={showInfo}
          isItemLoaded={index => !!playlistObject.items[index]}
          loadMore={loadMore}
          isLoading={playlistObject.isFetching}
          hasMore={!!playlistObject.nextUrl && !playlistObject.error && !playlistObject.isFetching}
        />
      )}
    </>
  );
};

GenericPlaylist.defaultProps = {
  showInfo: false
};

export default GenericPlaylist;
