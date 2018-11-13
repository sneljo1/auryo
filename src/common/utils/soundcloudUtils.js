import { CONFIG } from "../../config";
import { IMAGE_SIZES } from "../constants";

const endpoint = "https://api.soundcloud.com/";
const v2_endpoint = "https://api-v2.soundcloud.com/";
let memToken = null;

export function initialize(token) {
    memToken = token;
}

function makeUrl(uri, opts, v2) {
    const options = opts;
    if (options.client_id) { options.client_id = CONFIG.CLIENT_ID; }
    if (options.oauth_token) { options.oauth_token = memToken; }

    let url = endpoint;

    if (v2) { url = v2_endpoint; }

    // add uri
    url += uri;

    // Add query params
    url += `?${Object.keys(options).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`).join("&")}`;

    return url;
}

export function getTrackUrl(trackId) {
    return makeUrl(`tracks/${trackId}`, {
        client_id: true,
    });
}

export function getChartsUrl(genre, sort = "top", limit = 50) {
    return makeUrl("charts", {
        client_id: true,
        kind: sort,
        genre: `soundcloud:genres:${genre}`,
        limit,
    }, true);
}

export function getRemainingTracks() {
    return makeUrl("rate_limit_status", {
        client_id: true,
    });
}
export function registerPlayUrl() {
    return makeUrl("me/play-history", {
        oauth_token: true,
    }, true);
}

export function getUserUrl(artistID) {
    return makeUrl(`users/${artistID}`, {
        client_id: true,
    });
}

export function getUserTracksUrl(artistID, limit = 50) {
    return makeUrl(`users/${artistID}/tracks`, {
        client_id: true,
        linked_partitioning: 1,
        limit,
    });
}

export function getUserWebProfilesUrl(artistID) {
    return makeUrl(`users/${artistID}/web-profiles`, {
        client_id: true,
    });
}

export function getUserLikesUrl(artistID, limit = 50) {
    return makeUrl(`users/${artistID}/favorites`, {
        client_id: true,
        linked_partitioning: 1,
        limit,
    });
}

export function getAllUserPlaylistsUrl(artistID, limit = 50) {
    return makeUrl(`users/${artistID}/playlists/liked_and_owned`, {
        oauth_token: true,
        linked_partitioning: 1,
        limit,
    }, true);
}

export function getLikesUrl(limit = 50) {
    return makeUrl("me/favorites", {
        oauth_token: true,
        linked_partitioning: 1,
        limit,
    });
}

export function getLikeIdsUrl(limit = 5000) {
    return makeUrl("me/favorites/ids", {
        oauth_token: true,
        linked_partitioning: 1,
        limit,
    });
}

export function getPlaylistLikeIdsUrl(limit = 5000) {
    return makeUrl("me/playlist_likes/ids", {
        oauth_token: true,
        linked_partitioning: 1,
        limit,
    }, true);
}

export function getFeedUrl(limit = 15) {
    return makeUrl("stream", {
        linked_partitioning: 1,
        limit,
        oauth_token: true,
    }, true);
}

export function getPlaylistUrl() {
    return makeUrl("me/playlists", {
        oauth_token: true,
    });
}

export function getPlaylistupdateUrl(playlist_id) {
    return makeUrl(`playlists/${playlist_id}`, {
        oauth_token: true,
    }, true);
}

export function getTracks(ids) {
    return makeUrl("tracks", {
        ids: ids.join(","),
        oauth_token: true,
    }, true);
}

export function getPlaylistDeleteUrl(playlist_id) {
    return makeUrl(`playlists/${playlist_id}`, {
        oauth_token: true,
    });
}

export function getPlaylistTracksUrl(playlist_id) {
    return makeUrl(`playlists/${playlist_id}`, {
        oauth_token: true,
    }, true);
}

export function getRelatedUrl(trackId, limit = 50) {
    return makeUrl(`tracks/${trackId}/related`, {
        client_id: true,
        linked_partitioning: 1,
        limit,
    });
}

export function getCommentsUrl(trackId, limit = 20) {
    return makeUrl(`tracks/${trackId}/comments`, {
        client_id: true,
        linked_partitioning: 1,
        limit,
    });
}

export function getMeUrl() {
    return makeUrl("me", {
        oauth_token: true,
    });
}

export function getFollowingsUrl() {
    return makeUrl("me/followings/ids", {
        oauth_token: true,
        limit: 5000,
        linked_partitioning: 1,
    });
}

export function getRepostIdsUrl(playlist) {
    return makeUrl(`e1/me/${playlist ? 'playlist' : 'track'}_reposts/ids`, {
        oauth_token: true,
        limit: 5000,
        linked_partitioning: 1,
    });
}

export function updateLikeUrl(trackId) {
    return makeUrl(`me/favorites/${trackId}`, {
        oauth_token: true,
    });
}

export function updatePlaylistLikeUrl(userID, playlistID) {
    return makeUrl(`users/${userID}/playlist_likes/${playlistID}`, {
        oauth_token: true,
    }, true);
}

export function updateFollowingUrl(userID) {
    return makeUrl(`me/followings/${userID}`, {
        oauth_token: true,
    });
}

export function updateRepostUrl(trackId, playlist) {
    return makeUrl(`e1/me/${playlist ? 'playlist' : 'track'}_reposts/${trackId}`, {
        oauth_token: true,
    });
}

export function searchAllUrl(query, limit = 20, offset = 0) {
    return makeUrl("search", {
        oauth_token: true,
        q: query,
        limit,
        offset,
        linked_partitioning: 1,
        facet: "model",
    }, true);
}

export function searchTracksUrl(query, limit = 15, offset = 0) {
    return makeUrl("tracks", {
        oauth_token: true,
        q: query,
        limit,
        offset,
        linked_partitioning: 1,
    });
}

export function searchTagurl(genre, limit = 15, offset = 0) {
    return makeUrl("search/tracks", {
        oauth_token: true,
        q: '',
        "filter.genre": genre,
        limit,
        offset,
        linked_partitioning: 1,
    }, true);
}

export function discoverPlaylistsUrl(tag, limit = 15, offset = 0) {
    return makeUrl("playlists/discovery", {
        oauth_token: true,
        tag,
        limit,
        offset,
        linked_partitioning: 1,
    }, true);
}

export function searchUsersUrl(query, limit = 15, offset = 0) {
    return makeUrl("users", {
        oauth_token: true,
        q: query,
        limit,
        offset,
        linked_partitioning: 1,
    });
}

export function searchPlaylistsUrl(query, limit = 15, offset = 0) {
    return makeUrl("search/playlists", {
        oauth_token: true,
        q: query,
        limit,
        offset,
        linked_partitioning: 1,
    }, true);
}

export function resolveUrl(url) {
    return `${endpoint}resolve?client_id=${CONFIG.CLIENT_ID}&url=${url}`;
}

export function appendToken(url) {
    return `${url}&oauth_token=${memToken}`;
}

export function appendJustToken(url) {
    return `${url}?oauth_token=${memToken}`;
}

export function appendClientId(url) {
    return `${url}?client_id=${CONFIG.CLIENT_ID}`;
}

export function getImageUrl(track, size = null) {
    let s;
    if (typeof track === "object") {
        s = track.artwork_url;

        if ((!track.artwork_url || track.artwork_url == null) && track.user) {
            s = track.user.avatar_url;
        }
    } else {
        s = track;
    }

    let str = s;
    if (!str) {
        return "";
    }
    if (str.indexOf("default_avatar") > -1) {
        return str;
    }

    str = str.replace("http:", "");

    switch (size) {
        case IMAGE_SIZES.LARGE:
            return str.replace("large", IMAGE_SIZES.LARGE);
        case IMAGE_SIZES.XLARGE:
            return str.replace("large", IMAGE_SIZES.XLARGE);
        case IMAGE_SIZES.MEDIUM:
            return str.replace("large", IMAGE_SIZES.MEDIUM);
        case IMAGE_SIZES.XSMALL:
            return str.replace("large", IMAGE_SIZES.XSMALL);
        case IMAGE_SIZES.SMALL:
            return str;
        default:
            return str;
    }
}

/*
 * Util functions
 */

export function hasID(id, object) {
    return object && object[id] && object[id] === true;
}
export function isStreamable(track) {
    return track.streamable && (!track.policy || (track.policy && track.policy === 'ALLOW'));
}
