import _ from "lodash";
import fetchToJson from "../api/helpers/fetchToJson";

export function asJson(response) {
    return response.json();
}

function handleError(response) {
    const err = new Error(response.statusText);
    err.response = response;

    throw err;
}

/**
 * Handles non-200 statuses
 * @param  {Object} response
 * @return {Object} response
 * @throws {Error} on non-200 status
 */
export function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }// 429 api limit reached

    handleError(response);
}


export function toObject(collection) {
    return _.reduce(collection, (obj, t) => Object.assign({}, obj, { [t]: true }), {})
}