import { asJson, status, toObject } from '../../utils';

export default function fetchToObject(url: string): Promise<{ [key: string]: boolean }> {
    return fetch(url)
        .then(status)
        .then(asJson)
        .then((json) => {
            if (!json.collection.length) {
                return {};
            }

            return toObject(json.collection);
        });
}
