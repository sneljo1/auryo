import { asJson, status } from '../../utils';

export default function fetchToJson<T>(url: string, options = {}): Promise<T> {
    return fetch(url, options)
        .then(status)
        .then(asJson);
}
