import {json, status} from "../../utils";

/**
 * Fetch auth data
 *
 * @returns {Promise}
 */
export default function fetchToJson(url, options = {}) {
    return fetch(url, options)
        .then(status)
        .then(json);
}
