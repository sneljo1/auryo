import React from 'react'
import { OBJECT_TYPES } from '../../../shared/constants/global'
import PlaylistPage from '../playlists/Playlist'
import { AUDIO_GENRES, CHART_SORT_TYPE, MUSIC_GENRES } from '../../../shared/constants'
import { GENRE_IMAGES } from './ChartsPage'

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
        const { match } = this.props
        const { params: { genre } } = match

        let selectedGenre = MUSIC_GENRES.find(g => g.key === genre)

        if (!selectedGenre) {
            selectedGenre = AUDIO_GENRES.find(g => g.key === genre)
        }

        const object_id = `${genre}_${this.state.sort}`

        return <PlaylistPage
            showInfo
            chart
            backgroundImage={GENRE_IMAGES[selectedGenre.key]}
            gradient={selectedGenre.gradient}
            title={selectedGenre.name}
            object_id={object_id}
            sortType={this.state.sort}
            sortTypeChange={this.sortTypeChange}
            object_type={OBJECT_TYPES.PLAYLISTS}
        />
    }
}

export default ChartsDetailsPage