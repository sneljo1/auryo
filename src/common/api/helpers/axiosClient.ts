import axios, { AxiosError, AxiosRequestConfig } from "axios";
import is from "electron-is";
import * as rax from "retry-axios";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from "electron";
import { EVENTS } from "@common/constants";

// eslint-disable-next-line no-useless-escape
const TOKEN_REGEX = /(client_id|oauth_token)=(?<token>[^&]*|[A-Za-z0-9\-\._~\+\/])/gm;
// eslint-disable-next-line no-useless-escape
const OAUTH_TOKEN_REGEX = /(oauth_token)=(?<token>[^&]*|[A-Za-z0-9\-\._~\+\/])/gm;

const replaceTokenInRequest = (request: AxiosRequestConfig, token: string) => {
	if (request.url) {
		const reg = TOKEN_REGEX.exec(request.url);

		if (reg && reg.groups && reg.groups.token) {
			request.url = request.url.replace(reg.groups.token, token);
		}
	}
};

export const axiosClient = axios.create({
	// eslint-disable-next-line global-require
	adapter: is.dev() && require("axios/lib/adapters/http")
});

axiosClient.defaults.raxConfig = {
	instance: axiosClient
};

rax.attach(axiosClient);

// for multiple requests
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

axiosClient.interceptors.response.use(
	response => response,
	(error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & { hasRetried: boolean };

		console.log("URL", originalRequest.url);
		if (originalRequest.url && OAUTH_TOKEN_REGEX.exec(originalRequest.url)) {
			if (error.response && error.response.status === 401 && !originalRequest.hasRetried) {
				console.log("isRefreshing", isRefreshing);
				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					})
						.then((token: string) => {
							replaceTokenInRequest(originalRequest, token);
							return axios(originalRequest);
						})
						.catch(err => {
							return Promise.reject(err);
						});
				}

				originalRequest.hasRetried = true;
				isRefreshing = true;

				return new Promise((resolve, reject) => {
					ipcRenderer
						.invoke(EVENTS.APP.AUTH.REFRESH)
						.then(({ token }) => {
							console.log("refresh", { token });
							if (!token) {
								processQueue(new Error("No token"), null);
								reject(new Error("No token"));
							}

							replaceTokenInRequest(originalRequest, token);
							processQueue(null, token);
							resolve(axios(originalRequest));
						})
						.catch(err => {
							console.log("catch", { err });
							processQueue(err, null);
							reject(err);
						})
						.then(() => {
							isRefreshing = false;
						});
				});
			}
		}

		return Promise.reject(error);
	}
);
