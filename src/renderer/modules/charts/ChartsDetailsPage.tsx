import React from 'react';
import { RouteComponentProps } from 'react-router';
import { AUDIO_GENRES, GenreConfig, MUSIC_GENRES } from '../../../shared/constants';
import { SortTypes } from '../../../shared/store/playlist/types';
import PlaylistPage from '../playlists/Playlist';
import { GENRE_IMAGES } from './ChartsPage';

interface OwnProps extends RouteComponentProps<{ genre: string }> {

}

class ChartsDetailsPage extends React.Component<OwnProps> {

    state = {
        sort: SortTypes.TOP
    }

    sortTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            sort: event.target.value
        })
    }

    render() {
        const { match: { params: { genre } } } = this.props
        const { sort } = this.state;

        let selectedGenre: GenreConfig | undefined = MUSIC_GENRES.find(g => g.key === genre)

        if (!selectedGenre) {
            selectedGenre = AUDIO_GENRES.find(g => g.key === genre)
        }

        selectedGenre = selectedGenre as GenreConfig;

        const objectId = `${genre}_${sort}`

        return <PlaylistPage
            showInfo
            chart
            backgroundImage={GENRE_IMAGES[selectedGenre.key]}
            gradient={selectedGenre.gradient}
            title={selectedGenre.name}
            objectId={objectId}
            sortType={sort}
            sortTypeChange={this.sortTypeChange}
        />
    }
}

export default ChartsDetailsPage