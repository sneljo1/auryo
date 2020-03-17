import { AUDIO_GENRES, GenreConfig, MUSIC_GENRES } from '@common/constants';
import { SortTypes } from '@common/store/playlist/types';
import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { GenericPlaylist } from '../GenericPlaylist';
import { GENRE_IMAGES } from './genreImages';
import { PlaylistTypes } from '@common/store/objects';

type Props = RouteComponentProps<{ genre: string }>;

export const ChartsDetailsPage: FC<Props> = ({
  match: {
    params: { genre }
  }
}) => {
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.TOP);

  const selectedGenre = [...MUSIC_GENRES, ...AUDIO_GENRES].find(g => g.key === genre);

  if (!selectedGenre) {
    return null;
  }

  return (
    <GenericPlaylist
      showInfo
      backgroundImage={GENRE_IMAGES[selectedGenre.key]}
      gradient={selectedGenre.gradient}
      title={selectedGenre.name}
      playlistType={PlaylistTypes.CHART}
      objectId={`soundcloud:genres:${genre}`}
      sortType={sortType}
      onSortTypeChange={event => setSortType(event.target.value as SortTypes)}
    />
  );
};
