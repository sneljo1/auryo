import {json, status, toObject} from "../../utils";

export default function fetchToObject(url) {
    return fetch(url)
        .then(status)
        .then(json)
        .then(json => toObject(json.collection));
}