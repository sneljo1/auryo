import * as winston from 'winston';
import * as path from 'path';
import { app } from 'electron';

const defaultFileLogLevel = 'info';
const defaultConsoleLogLevel = process.env.NODE_ENV === 'development' || process.env.ENV === 'development' ? 'debug' : 'info';

function prodFormat() {
  const replaceError = ({ label, level, message, stack }: any) => ({ label, level, message, stack });
  const replacer = (_key: any, value: any) => value instanceof Error ? replaceError(value) : value;
  return winston.format.json({ replacer });
}

function devFormat() {
  const formatMessage = (info: any) => `${info.level} ${info.message}`;
  const formatError = (info: any) => `${info.level} ${info.stack}\n`;
  const format = (info: any) => info.stack ? formatError(info) : formatMessage(info);
  return winston.format.printf(format);
}

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
            (process.env.NODE_ENV === 'production' ? prodFormat() : devFormat()),
            winston.format.label({ label: id }),
          )
        })
      ]
    });

  }

  public error(...args: Array<any>) {
    if (args.length > 0) {
      const errorIndex = args.findIndex((item) => item instanceof Error);

      if (errorIndex >= 0) {
        const error: Error = args.splice(errorIndex, 1)[0];

        this.logger.error({
          stack: error.stack,
          message: error.message
        });

        return;
      }
    }

    this.logger.error.apply(this.logger, args);
  }

  public warn(..._args: Array<any>) {
    this.logger.warn.apply(this.logger, arguments);
  }

  public info(..._args: Array<any>) {
    this.logger.info.apply(this.logger, arguments);
  }

  public verbose(..._args: Array<any>) {
    this.logger.verbose.apply(this.logger, arguments);
  }

  public debug(..._args: Array<any>) {
    this.logger.debug.apply(this.logger, arguments);
  }

  public silly(..._args: Array<any>) {
    this.logger.silly.apply(this.logger, arguments);
  }

  public log(..._args: Array<any>) {
    this.logger.log.apply(this.logger, arguments);
  }

  public profile(..._args: Array<any>) {
    this.logger.profile.apply(this.logger, arguments);
  }
}
