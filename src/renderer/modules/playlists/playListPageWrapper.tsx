import React from 'react';
import PlaylistPage from './Playlist';

const playlistPage = (name: string, objectId: string, showInfo = true) => {
    return () => (
        <PlaylistPage
            key={name}
            title={name}
            showInfo={showInfo}
            objectId={objectId}
        />
    );
};

export default playlistPage;
