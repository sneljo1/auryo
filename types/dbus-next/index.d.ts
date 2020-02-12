declare module "dbus-next" {
  export class DBusError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(type: any, text: any);
    name: any;
    type: any;
    text: any;
  }
  export class Variant {
    constructor(signature: any, value: any);
    signature: any;
    value: any;
  }
  export function createClient(params: any): any;
  export function createConnection(opts: any): any;
  export function createServer(handler: any): any;
  export const messageType: {
    error: number;
    invalid: number;
    methodCall: number;
    methodReturn: number;
    signal: number;
  };
  export function sessionBus(opts?: any): any;
  export function setBigIntCompat(val: any): void;
  export function systemBus(): any;
  export namespace validators {
    function assertInterfaceNameValid(name: any): void;
    function assertMemberNameValid(name: any): void;
    function assertObjectPathValid(path: any): void;
    function isInterfaceNameValid(name: any): any;
    function isMemberNameValid(name: any): any;
    function isObjectPathValid(path: any): any;
  }
}
