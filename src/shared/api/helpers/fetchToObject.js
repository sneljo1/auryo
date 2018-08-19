import { asJson, status, toObject } from "../../utils";

export default function fetchToObject(url) {
    return fetch(url)
        .then(status)
        .then(asJson)
        .then(json => toObject(json.collection));
}