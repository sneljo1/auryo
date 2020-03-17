import { getGenericPlaylist, genericPlaylistFetchMore } from '@common/store/actions';
import { PlaylistTypes } from '@common/store/objects';
import { getPlaylistObjectSelector } from '@common/store/objects/selectors';
import { SortTypes } from '@common/store/playlist/types';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

interface OwnProps {
  playlistType: PlaylistTypes;
  objectId?: string;
  title: string;
  backgroundImage?: string;
  gradient?: string;
  sortType?: SortTypes;
  showInfo?: boolean;
  onSortTypeChange?(event: React.ChangeEvent<HTMLSelectElement>): void;
}

type AllProps = OwnProps;

export const GenericPlaylist: FC<AllProps> = ({
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
  const playlistObject = useSelector(getPlaylistObjectSelector({ objectId, playlistType }));

  useEffect(() => {
    dispatch(
      getGenericPlaylist.request({
        playlistType,
        refresh: true,
        sortType,
        objectId
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]);

  const { loadMore } = useLoadMorePromise(
    playlistObject?.isFetching,
    () => {
      dispatch(genericPlaylistFetchMore.request({ playlistType, objectId }));
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

  if (!playlistObject || (playlistObject && playlistObject.isFetching && !playlistObject.items.length)) {
    return <Spinner contained />;
  }

  return (
    <>
      <SetLayoutSettings hasImage={!!backgroundImage} />
      <PageHeader image={backgroundImage} gradient={gradient}>
        <>
          {isChart && renderChartSort()}
          <h2>{title}</h2>
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
          playlistType={playlistType}
          objectId={objectId}
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
