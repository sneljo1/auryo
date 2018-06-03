import winston from 'winston';
import path from 'path';
import { app } from 'electron';

const defaultFileLogLevel = 'info';
const defaultConsoleLogLevel = (process.env.NODE_ENV === 'development' || process.env.ENV === 'development') ? 'debug' : 'error';

const Logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: path.resolve(app.getPath('userData'), 'auryo.log'),
            level: defaultFileLogLevel,
            maxsize: 5000000,
            maxfiles: 2
        }),
        new (winston.transports.Console)({
            level: defaultConsoleLogLevel,
            prettyPrint: true,
            handleExceptions: true,
            colorize: true
        })
    ]
});

export {
    Logger
};

export default Logger;