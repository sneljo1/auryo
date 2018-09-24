import * as winston from 'winston';
import * as path from 'path';
import { app } from 'electron';

const defaultFileLogLevel = 'info';
const defaultConsoleLogLevel = process.env.NODE_ENV === 'development' || process.env.ENV === 'development' ? 'debug' : 'info';

export class Logger {
  private logger: winston.Logger;

  constructor(id: string) {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: path.resolve(app.getPath('userData'), 'auryo.log'),
          level: defaultFileLogLevel,
          maxsize: 5000000,
        }),
        new winston.transports.Console({
          level: defaultConsoleLogLevel,
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.simple(),
            winston.format.label({ label: id })
          )
        })
      ]
    });

  }

  public error(...args: any[]) {
    if (args.length > 0) {
      const errorIndex = args.findIndex(item => item instanceof Error);

      if (errorIndex >= 0) {
        const error: Error = args.splice(errorIndex, 1)[0];

        this.logger.error(
          args.toString(),
          error.message,
          JSON.stringify({
            stack: error.stack
          })
        );

        return;
      }
    }

    this.logger.error.apply(this.logger, args);
  }

  public warn(...args: any[]) {
    this.logger.warn.apply(this.logger, arguments);
  }

  public info(...args: any[]) {
    this.logger.info.apply(this.logger, arguments);
  }

  public verbose(...args: any[]) {
    this.logger.verbose.apply(this.logger, arguments);
  }

  public debug(...args: any[]) {
    this.logger.debug.apply(this.logger, arguments);
  }

  public silly(...args: any[]) {
    this.logger.silly.apply(this.logger, arguments);
  }

  public log(...args: any[]) {
    this.logger.log.apply(this.logger, arguments);
  }

  public profile(...args: any[]) {
    this.logger.profile.apply(this.logger, arguments);
  }
}
