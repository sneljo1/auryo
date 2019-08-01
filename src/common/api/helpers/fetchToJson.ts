import { asJson, status } from "../../utils";

export default async function fetchToJson<T>(url: string, options: any = {}): Promise<T> {
    return fetch(url, { ...options})
        .then(status)
        .then(asJson);
}
