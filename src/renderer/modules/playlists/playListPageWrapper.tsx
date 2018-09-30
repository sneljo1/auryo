import React from 'react';
import PlaylistPage from './Playlist';

const playlistPage = (name: string, objectId: string, showInfo = true) => {
    return () => (
        <PlaylistPage
            title={name}
            showInfo={showInfo}
            objectId={objectId}
        />
    );
};

export default playlistPage;
