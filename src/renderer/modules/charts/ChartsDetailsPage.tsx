import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { AUDIO_GENRES, GenreConfig, MUSIC_GENRES } from '../../../common/constants';
import { SortTypes } from '../../../common/store/playlist/types';
import PlaylistPage from '../playlists/Playlist';
import { GENRE_IMAGES } from './ChartsPage';

interface OwnProps extends RouteComponentProps<{ genre: string }> {

}

interface State {
    sort: SortTypes;
}

class ChartsDetailsPage extends React.Component<OwnProps> {

    readonly state: State = {
        sort: SortTypes.TOP
    };

    sortTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            sort: event.target.value
        });
    }

    render() {
        const { match: { params: { genre } } } = this.props;
        const { sort } = this.state;

        let selectedGenre: GenreConfig | undefined = MUSIC_GENRES.find((g) => g.key === genre);

        if (!selectedGenre) {
            selectedGenre = AUDIO_GENRES.find((g) => g.key === genre);
        }

        selectedGenre = selectedGenre as GenreConfig;

        const objectId = `${genre}_${sort}`;

        return (
            <PlaylistPage
                showInfo={true}
                chart={true}
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

export default ChartsDetailsPage;
