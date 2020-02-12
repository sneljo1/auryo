import { AxiosRequestConfig } from 'axios';
import fetchToJson from './fetchToJson';

function toObject(collection: string[]): { [key: string]: boolean } {
  return collection.reduce((obj, t) => ({ ...obj, [t]: true }), {});
}

export default async function fetchToObject(
  url: string,
  options?: AxiosRequestConfig
): Promise<{ [key: string]: boolean }> {
  return fetchToJson<{ collection?: [] }>(url, options).then(json => {
    if (!json.collection || !json.collection.length) {
      return {};
    }

    return toObject(json.collection);
  });
}
