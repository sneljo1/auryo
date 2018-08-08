import { CLIENT_ID } from '../../config'
import { IMAGE_SIZES } from '../../shared/constants'

const _endpoint = 'https://api.soundcloud.com/'
const _v2_endpoint = 'https://api-v2.soundcloud.com/'
let _token = undefined

export function initialize(token) {
    _token = token

    const soundcloud = require('soundcloud')

    soundcloud.initialize({
        client_id: CLIENT_ID
    })

}

function makeUrl(uri, options, v2) {
    if (options.client_id) options.client_id = CLIENT_ID
    if (options.oauth_token) options.oauth_token = _token

    let url = _endpoint

    if (v2) url = _v2_endpoint

    // add uri
    url += uri

    // Add query params
    url += '?' + Object.keys(options).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`).join('&')

    return url
}


export function getTrackUrl(trackID) {
    return makeUrl('tracks/' + trackID, {
        client_id: true
    })
}

export function getChartsUrl(genre, sort = 'top', limit = 50) {
    return makeUrl('charts', {
        client_id: true,
        kind: sort,
        genre: 'soundcloud:genres:' + genre,
        limit
    }, true)
}

export function getUserUrl(artistID) {
    return makeUrl('users/' + artistID, {
        client_id: true
    })
}

export function getUserTracksUrl(artistID, limit = 50) {
    return makeUrl('users/' + artistID + '/tracks', {
        client_id: true,
        linked_partitioning: 1,
        limit: limit
    })
}

export function getUserWebProfilesUrl(artistID) {
    return makeUrl('users/' + artistID + '/web-profiles', {
        client_id: true
    })
}

export function getUserLikesUrl(artistID, limit = 50) {
    return makeUrl('users/' + artistID + '/favorites', {
        client_id: true,
        linked_partitioning: 1,
        limit: limit
    })
}

export function getAllUserPlaylistsUrl(artistID, limit = 50) {
    return makeUrl('users/' + artistID + '/playlists/liked_and_owned', {
        oauth_token: true,
        linked_partitioning: 1,
        limit: limit
    }, true)
}

export function getLikesUrl(limit = 50) {
    return makeUrl('me/favorites', {
        oauth_token: true,
        linked_partitioning: 1,
        limit: limit
    })
}

export function getLikeIdsUrl(limit = 5000) {
    return makeUrl('me/favorites/ids', {
        oauth_token: true,
        linked_partitioning: 1,
        limit: limit
    })
}

export function getPlaylistLikeIdsUrl(limit = 5000) {
    return makeUrl('me/playlist_likes/ids', {
        oauth_token: true,
        linked_partitioning: 1,
        limit: limit
    }, true)
}

export function getFeedUrl(limit = 15) {
    return makeUrl('stream', {
        linked_partitioning: 1,
        limit: limit,
        oauth_token: true
    }, true)
}

export function getPlaylistUrl() {
    return makeUrl('me/playlists', {
        oauth_token: true
    })
}

export function getPlaylistupdateUrl(playlist_id) {
    return makeUrl('playlists/' + playlist_id, {
        oauth_token: true
    }, true)
}

export function getTracks(ids) {
    return makeUrl('tracks', {
        ids: ids.join(','),
        oauth_token: true
    }, true)
}

export function getPlaylistDeleteUrl(playlist_id) {
    return makeUrl('playlists/' + playlist_id, {
        oauth_token: true
    })
}

export function getPlaylistTracksUrl(playlist_id) {
    return makeUrl('playlists/' + playlist_id, {
        oauth_token: true
    }, true)
}

export function getRelatedUrl(trackID, limit = 50) {
    return makeUrl('tracks/' + trackID + '/related', {
        client_id: true,
        linked_partitioning: 1,
        limit: limit
    })
}

export function getCommentsUrl(trackID, limit = 20) {
    return makeUrl('tracks/' + trackID + '/comments', {
        client_id: true,
        linked_partitioning: 1,
        limit: limit
    })
}

export function getMeUrl() {
    return makeUrl('me', {
        oauth_token: true
    })
}

export function getFollowingsUrl() {
    return makeUrl('me/followings/ids', {
        oauth_token: true,
        limit: 5000,
        linked_partitioning: 1
    })
}

export function getRepostIdsUrl() {
    return makeUrl('e1/me/track_reposts/ids', {
        oauth_token: true,
        limit: 5000,
        linked_partitioning: 1
    })
}

export function updateLikeUrl(trackID) {
    return makeUrl('me/favorites/' + trackID, {
        oauth_token: true
    })
}

export function updatePlaylistLikeUrl(userID, playlistID) {
    return makeUrl('users/' + userID + '/playlist_likes/' + playlistID, {
        oauth_token: true
    }, true)
}

export function updateFollowingUrl(userID) {
    return makeUrl('me/followings/' + userID, {
        oauth_token: true
    })
}

export function updateRepostUrl(trackID) {
    return makeUrl('e1/me/track_reposts/' + trackID, {
        oauth_token: true
    })
}

export function searchAllUrl(query, limit = 20, offset = 0) {
    return makeUrl('search', {
        oauth_token: true,
        q: query,
        limit: limit,
        offset: offset,
        linked_partitioning: 1,
        facet: 'model'
    }, true)
}

export function searchTracksUrl(query, limit = 15, offset = 0) {
    return makeUrl('tracks', {
        oauth_token: true,
        q: query,
        limit: limit,
        offset: offset,
        linked_partitioning: 1
    })
}

export function searchUsersUrl(query, limit = 15, offset = 0) {
    return makeUrl('users', {
        oauth_token: true,
        q: query,
        limit: limit,
        offset: offset,
        linked_partitioning: 1
    })
}

export function searchPlaylistsUrl(query, limit = 15, offset = 0) {
    return makeUrl('search/playlists', {
        oauth_token: true,
        q: query,
        limit: limit,
        offset: offset,
        linked_partitioning: 1
    }, true)
}

export function resolveUrl(url) {
    return _endpoint + 'resolve?client_id=' + CLIENT_ID + '&url=' + url
    return makeUrl('resolve', {
        url: url,
        client_id: true
    })
}

export function appendToken(url) {
    return url + '&oauth_token=' + _token
}

export function appendJustToken(url) {
    return url + '?oauth_token=' + _token
}

export function appendClientId(url) {
    return url + '?client_id=' + CLIENT_ID
}

export function getImageUrl(track, size = null) {
    let s
    if (typeof track == 'object') {
        s = track.artwork_url

        if ((!track.artwork_url || track.artwork_url == null) && track.user) {
            s = track.user.avatar_url
        }
    } else {
        s = track
    }


    let str = s
    if (!str) {
        return ''
    }
    if (str.indexOf('default_avatar') > -1) {
        return str
    }

    str = str.replace('http:', '')


    switch (size) {
        case IMAGE_SIZES.LARGE:
            return str.replace('large', IMAGE_SIZES.LARGE)
        case IMAGE_SIZES.XLARGE:
            return str.replace('large', IMAGE_SIZES.XLARGE)
        case IMAGE_SIZES.MEDIUM:
            return str.replace('large', IMAGE_SIZES.MEDIUM)
        case IMAGE_SIZES.XSMALL:
            return str.replace('large', IMAGE_SIZES.XSMALL)
        case IMAGE_SIZES.SMALL:
            return str
        default:
            return str
    }
}

/*
 * Util functions
 */

export function hasID(id, object) {
    return object && (id in object) && object[id] == 1
}
