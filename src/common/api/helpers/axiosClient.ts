import { EVENTS } from '@common/constants';
import axios, { AxiosRequestConfig } from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import is from 'electron-is';
import * as rax from 'retry-axios';
import { initialize } from '@common/utils/soundcloudUtils';

// eslint-disable-next-line no-useless-escape
const OAUTH_TOKEN_REGEX = /oauth_token=(?<token>[A-Za-z0-9\-\._~\+\/]*)/s;

const replaceTokenInRequest = (request: AxiosRequestConfig, token: string) => {
  if (request.url) {
    const reg = OAUTH_TOKEN_REGEX.exec(request.url);

    if (reg?.groups?.token) {
      request.url = request.url.replace(reg.groups.token, token);
    }
  }
};

export const axiosClient = axios.create({
  // eslint-disable-next-line global-require
  adapter: is.dev() && require('axios/lib/adapters/http')
});

axiosClient.defaults.raxConfig = {
  instance: axiosClient
};

rax.attach(axiosClient);

let isRefreshing = false;
let subscribers: Function[] = [];

function onRefreshed(token: string) {
  subscribers.map(cb => cb(token));
}

function subscribeTokenRefresh(cb: Function) {
  subscribers.push(cb);
}

axiosClient.interceptors.response.use(undefined, err => {
  const { config, response } = err;
  const originalRequest = config as AxiosRequestConfig & { hasRetried: boolean };
  const status = response?.status;

  const tokenMatch = OAUTH_TOKEN_REGEX.exec(originalRequest?.url || '');

  if (!tokenMatch?.groups) {
    return Promise.reject(err);
  }

  if (status === 401 && !originalRequest.hasRetried) {
    if (!isRefreshing) {
      isRefreshing = true;
      let invokePromise: Promise<void | { token: string }> = Promise.resolve();

      if (is.renderer()) {
        invokePromise = ipcRenderer.invoke(EVENTS.APP.AUTH.REFRESH);
      }

      invokePromise.then(obj => {
        isRefreshing = false;

        if (!obj || !obj?.token) {
          throw new Error('no token');
        }

        initialize(obj.token);
        onRefreshed(obj.token);
        subscribers = [];
      });
    }

    return new Promise(resolve => {
      subscribeTokenRefresh((token: string) => {
        replaceTokenInRequest(originalRequest, token);
        originalRequest.hasRetried = true;
        resolve(axios(originalRequest));
      });
    });
  }

  return Promise.reject(err);
});
