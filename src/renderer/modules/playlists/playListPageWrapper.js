import PlaylistPage from './Playlist'
import { OBJECT_TYPES } from '../../../shared/constants/global'
import React from 'react'

const playlistPage = (name, object_id, showInfo = true) => {
    return () => (
        <PlaylistPage
            title={name}
            showInfo={showInfo}
            object_id={object_id}
            object_type={OBJECT_TYPES.PLAYLISTS}
        />
    )
}

export default playlistPage