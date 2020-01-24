import axios from "axios";
import is from "electron-is";
import * as rax from "retry-axios";

export const axiosClient = axios.create({
	// eslint-disable-next-line global-require
	adapter: is.dev() && require("axios/lib/adapters/http")
});

axiosClient.defaults.raxConfig = {
	instance: axiosClient
};

rax.attach(axiosClient);
