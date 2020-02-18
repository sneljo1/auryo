import { AUDIO_GENRES, GenreConfig, MUSIC_GENRES } from '@common/constants';
import { SortTypes } from '@common/store/playlist/types';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import PlaylistPage from '../playlists/Playlist';
import { GENRE_IMAGES } from './genreImages';

type OwnProps = RouteComponentProps<{ genre: string }>;

interface State {
  sort: SortTypes;
}

export class ChartsDetailsPage extends React.PureComponent<OwnProps> {
  public readonly state: State = {
    sort: SortTypes.TOP
  };

  public sortTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      sort: event.target.value
    });
  };

  public render() {
    const {
      match: {
        params: { genre }
      }
    } = this.props;
    const { sort } = this.state;

    let selectedGenre: GenreConfig | undefined = MUSIC_GENRES.find(g => g.key === genre);

    if (!selectedGenre) {
      selectedGenre = AUDIO_GENRES.find(g => g.key === genre);
    }

    selectedGenre = selectedGenre as GenreConfig;

    const objectId = `${genre}_${sort}`;

    return (
      <PlaylistPage
        showInfo
        chart
        backgroundImage={GENRE_IMAGES[selectedGenre.key]}
        gradient={selectedGenre.gradient}
        title={selectedGenre.name}
        objectId={objectId}
        sortType={sort}
        sortTypeChange={this.sortTypeChange}
      />
    );
  }
}
