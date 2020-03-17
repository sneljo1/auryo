import { AxiosRequestConfig } from 'axios';
import { axiosClient } from './axiosClient';
import { CONFIG } from '../../../config';
import { memToken } from '@common/utils/soundcloudUtils';

const soundCloudBaseUrl = 'https://api.soundcloud.com/';
const soundCloudBaseUrlV2 = 'https://api-v2.soundcloud.com/';

export interface FetchOptions {
  uri?: string;
  clientId?: string | boolean;
  oauthToken?: boolean;
  useV2Endpoint?: boolean;
  queryParams?: any;
}

export default async function fetchToJsonNew<T>(
  fetchOptions: FetchOptions,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const { queryParams = {} } = fetchOptions;

  if (fetchOptions.clientId) {
    if (typeof fetchOptions.clientId === 'string') {
      // eslint-disable-next-line no-self-assign
      queryParams.client_id = fetchOptions.clientId;
    } else {
      queryParams.client_id = CONFIG.CLIENT_ID;
    }
  }

  if (fetchOptions.oauthToken) {
    queryParams.oauth_token = memToken;
  }

  let baseUrl = soundCloudBaseUrl;

  if (fetchOptions.useV2Endpoint) {
    baseUrl = soundCloudBaseUrlV2;
  }

  // eslint-disable-next-line no-return-await
  return await axiosClient
    .request<T>({
      url: `${baseUrl}${fetchOptions.uri}`,
      params: queryParams,
      ...options
    })
    .then(res => res.data);
}
