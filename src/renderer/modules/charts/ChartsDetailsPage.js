import React from 'react'
import { OBJECT_TYPES } from '../../../shared/constants/global'
import PlaylistPage from '../playlists/Playlist'
import { AUDIO_GENRES, MUSIC_GENRES } from '../../../shared/constants'

class ChartsDetailsPage extends React.Component {
    render() {
        const { match } = this.props
        const { params: { genre } } = match

        let selectedGenre = MUSIC_GENRES.find(g => g.key === genre)

        if(!selectedGenre){
            selectedGenre = AUDIO_GENRES.find(g => g.key === genre)
        }

        return <PlaylistPage
            showInfo
            chart
            title={selectedGenre.name}
            object_id={genre}
            object_type={OBJECT_TYPES.PLAYLISTS}
        />
    }
}

export default ChartsDetailsPage