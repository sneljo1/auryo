import { getForYouSelection } from '@common/store/actions';
import { getAuthPersonalizedPlaylistsSelector, getPlaylistEntities } from '@common/store/selectors';
import cn from 'classnames';
import { stopForwarding } from 'electron-redux';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { SoundCloud } from '../../../types';
import Spinner from '../../_shared/Spinner/Spinner';
import { PersonalizedPlaylistCard } from './components/PersonalizedPlaylistCard/PersonalizedPlaylistCard';
import styles from './ForYouPage.module.scss';

type Props = RouteComponentProps;

export const ForYou: FC<Props> = () => {
  const dispatch = useDispatch();
  const [itemsOpen, setItemsOpen] = useState<{ [key: string]: number }>({});
  const isLoading = useSelector((state) => getAuthPersonalizedPlaylistsSelector(state).isLoading);
  const items = useSelector((state) => getAuthPersonalizedPlaylistsSelector(state).items);
  const error = useSelector((state) => getAuthPersonalizedPlaylistsSelector(state).error);
  const playlistEntities = useSelector(getPlaylistEntities());

  useEffect(() => {
    dispatch(stopForwarding(getForYouSelection.request({})));
  }, [dispatch]);

  if (isLoading && !items?.length && !error) {
    return <Spinner contained />;
  }

  const rest = items ? [...items] : [];

  const weeklyIndex = rest.findIndex((i) => i.query_urn?.indexOf('weekly') !== -1);
  const weekly = rest.splice(weeklyIndex, 1)[0];

  const uploadIndex = rest.findIndex((i) => i.query_urn?.indexOf('newforyou') !== -1);
  const upload = rest.splice(uploadIndex, 1)[0];

  const combinedCollection = [...(weekly?.items.collection || []), ...(upload?.items.collection || [])];

  const renderPlaylist = (title: string, description: string, collection: string[] = []) => {
    const ids = collection;
    const shown = itemsOpen[title] || 6;
    const showMore = shown < ids.length;

    return (
      <>
        <h3 className={styles.header}>{title}</h3>
        <div className={styles.subtitle}>{description}</div>

        <div className={cn(styles.playlists, 'row')}>
          {collection.slice(0, shown || 6).map((id) => {
            const playlist: SoundCloud.SystemPlaylist = playlistEntities[id];

            if (!playlist) {
              return null;
            }

            return (
              <div key={id} className="col-12 col-xs-6 col-md-4">
                <PersonalizedPlaylistCard playlist={playlist} system />
              </div>
            );
          })}
          {collection.length > 6 && (
            <div className="col-12 text-right">
              <a
                role="button"
                className={styles.showMore}
                onClick={() => {
                  let nextPos = shown + 6;

                  if (showMore) {
                    if (nextPos > ids.length) {
                      nextPos = ids.length;
                    }
                  } else {
                    nextPos = 6;
                  }

                  setItemsOpen({
                    ...itemsOpen,
                    [title]: nextPos
                  });
                }}>
                <i className={`bx bx-${!showMore ? 'chevron-up' : 'chevron-down'}`} />
              </a>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={styles.container}>
      {weekly && renderPlaylist('Made for you', 'Playlists created by SoundCloud just for you', combinedCollection)}
      {rest && rest.map((i) => <div key={i.urn}>{renderPlaylist(i.title, i.description, i.items.collection)}</div>)}
    </div>
  );
};

export default ForYou;
