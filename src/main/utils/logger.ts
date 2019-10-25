import pino from "pino";
import rfs from "rotating-file-stream";
// eslint-disable-next-line import/no-cycle
import { Utils } from "./utils";

const isProd = false; // process.env.NODE_ENV === "production" && process.env.ENV !== "development";

let stream: pino.DestinationStream;

if (isProd) {
	stream = rfs("main.log", {
		path: Utils.getLogDir(),
		maxFiles: 1,
		size: "10M",
		interval: "7d"
	});
}

const config: pino.LoggerOptions = {
	prettyPrint: !isProd && {
		colorize: true
	},
	base: null,
	level: isProd ? "info" : "debug"
};

export type LoggerInstance = pino.Logger;

export class Logger {
	static createLogger(name: string): LoggerInstance {
		if (!isProd) {
			config.name = name;
		}

		return pino(
			{
				...config,
				base: isProd ? {} : { name }
			},
			stream
		);
	}

	static defaultLogger(): LoggerInstance {
		return pino(
			{
				...config
			},
			stream
		);
	}
}
