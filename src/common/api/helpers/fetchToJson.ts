import { AxiosRequestConfig } from 'axios';
import { axiosClient } from './axiosClient';

export default async function fetchToJson<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  // eslint-disable-next-line no-return-await
  return await axiosClient
    .request<T>({
      url,
      ...options
    })
    .then(res => res.data);
}
