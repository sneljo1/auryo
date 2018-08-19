import PropTypes from "prop-types";
import React from 'react';
import { AUDIO_GENRES, CHART_SORT_TYPE, MUSIC_GENRES } from '../../../shared/constants';
import { OBJECT_TYPES } from '../../../shared/constants/global';
import PlaylistPage from '../playlists/Playlist';
import { GENRE_IMAGES } from './ChartsPage';

class ChartsDetailsPage extends React.Component {

    state = {
        sort: CHART_SORT_TYPE.TOP
    }

    sortTypeChange = (e) => {
        this.setState({
            sort: e.target.value
        })
    }

    render() {
        const { match: { params: { genre } } } = this.props
        const { sort } = this.state;

        let selectedGenre = MUSIC_GENRES.find(g => g.key === genre)

        if (!selectedGenre) {
            selectedGenre = AUDIO_GENRES.find(g => g.key === genre)
        }

        const object_id = `${genre}_${sort}`

        return <PlaylistPage
            showInfo
            chart
            backgroundImage={GENRE_IMAGES[selectedGenre.key]}
            gradient={selectedGenre.gradient}
            title={selectedGenre.name}
            object_id={object_id}
            sortType={sort}
            sortTypeChange={this.sortTypeChange}
            object_type={OBJECT_TYPES.PLAYLISTS}
        />
    }
}

ChartsDetailsPage.propTypes = {
    match: PropTypes.object.isRequired
}

export default ChartsDetailsPage