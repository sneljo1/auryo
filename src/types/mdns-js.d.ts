export class Advertisement {
  constructor(networking: any, serviceType: any, port: any, options: any);
  serviceType: any;
  port: any;
  options: any;
  nameSuffix: any;
  alias: any;
  status: any;
  networking: any;
  start: any;
  stop: any;
}
export class Browser {
  static defaultMaxListeners: any;
  static init(): void;
  static listenerCount(emitter: any, type: any): any;
  static usingDomains: boolean;
  constructor(networking: any, serviceType: any);
  serviceType: any;
  networking: any;
  connections: any;
  onMessageListener: any;
  addListener(type: any, listener: any): any;
  discover(): void;
  emit(type: any, args: any): any;
  eventNames(): any;
  getMaxListeners(): any;
  listenerCount(type: any): any;
  listeners(type: any): any;
  off(type: any, listener: any): any;
  on(type: any, listener: any): any;
  onMessage(packets: any, remote: any, connection: any): void;
  once(type: any, listener: any): any;
  prependListener(type: any, listener: any): any;
  prependOnceListener(type: any, listener: any): any;
  rawListeners(type: any): any;
  removeAllListeners(type: any, ...args: any[]): any;
  removeListener(type: any, listener: any): any;
  setMaxListeners(n: any): any;
  stop(): void;
}
export namespace Browser {
  class EventEmitter {
    // Circular reference from index.Browser.EventEmitter
    static EventEmitter: any;
    static defaultMaxListeners: any;
    static init(): void;
    static listenerCount(emitter: any, type: any): any;
    static usingDomains: boolean;
    addListener(type: any, listener: any): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    getMaxListeners(): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    rawListeners(type: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    setMaxListeners(n: any): any;
  }
}
export class ServiceType {
  static wildcard: string;
  constructor(...args: any[]);
  name: any;
  protocol: any;
  subtypes: any;
  description: any;
  fromArray(array: any): void;
  fromJSON(obj: any): void;
  fromString(text: any): void;
  getDescription(): any;
  isWildcard(): any;
  matches(other: any): any;
  toArray(): any;
}
export function createAdvertisement(serviceType: any, port: any, options: any): any;
export function createBrowser(serviceType: any): any;
export function excludeInterface(iface: any): void;
export function makeServiceType(...args: any[]): any;
export const name: string;
export function tcp(...args: any[]): any;
export function udp(...args: any[]): any;
export const version: string;
