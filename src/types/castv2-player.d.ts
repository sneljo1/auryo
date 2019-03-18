export class LogWrapper {
  constructor(logger: any);
  logger: any;
  debug(...args: any[]): void;
  error(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
}
export function MediaPlayer(logClass: any): any;
export function Scanner(_logClass: any): any;
export function ScannerPromise(_logClass: any): any;
