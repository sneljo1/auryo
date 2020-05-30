import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { SC } from '@common/utils';

export * from './playlist/api';
export * from './track/api';
export * from './user/api';

export async function fetchFromUrl<T>(url: string) {
  const json = await fetchToJsonNew<T>(
    {
      oauthToken: true,
      useV2Endpoint: true
    },
    {
      url: SC.appendToken(url)
    }
  );

  return json;
}
