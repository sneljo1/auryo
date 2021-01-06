import { memToken } from '@common/utils/soundcloudUtils';
import * as querystring from 'querystring';
import { fromFetch } from 'rxjs/fetch';
import { CONFIG } from '../../../config';

const soundCloudBaseUrl = 'https://api.soundcloud.com/';
const soundCloudBaseUrlV2 = 'https://api-v2.soundcloud.com/';

export interface FetchOptions {
  uri?: string;
  clientId?: string | boolean;
  oauthToken?: boolean;
  useV2Endpoint?: boolean;
  queryParams?: any;
  url?: string;
}

export default function fetchToJsonNew<T>(fetchOptions: FetchOptions, options: RequestInit = {}) {
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

  return fromFetch<T>(fetchOptions.url ?? `${baseUrl}${fetchOptions.uri}?${querystring.stringify(queryParams)}`, {
    selector: response => {
      if (!response.ok) throw response;

      return response.json();
    },
    ...options
  });
}
