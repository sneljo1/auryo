import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production' && process.env.ENV !== 'development';

const config: pino.LoggerOptions = {
  prettyPrint: !isProd,
  base: null,
  level: isProd ? 'info' : process.env.LOG_LEVEL ?? 'debug'
};

export type LoggerInstance = pino.Logger;

export class Logger {
  static createLogger(name: string): LoggerInstance {
    if (!isProd) {
      config.name = name;
    }

    return pino({
      ...config,
      base: isProd ? {} : { name }
    });
  }

  static defaultLogger(): LoggerInstance {
    return pino({
      ...config
    });
  }
}
