

declare module 'mdns-cast-browser' {
    import { EventEmitter } from "events";

    namespace A {
        export interface MDNSAddress {
            port: number;
            host: string;
        }

        export interface Device {
            id: string;
            name: string;
            address: MDNSAddress;
            groups: string[];
            toObject(): this;
        }
    }

    interface A extends EventEmitter {
        discover(): void;
        getDevice(id: string): A.Device;
        getDevices(): A.Device[];

        on(event: "deviceUp", listener: (device: A.Device) => void): this;
        on(event: "deviceDown", listener: (device: A.Device) => void): this;
        on(event: "deviceChange", listener: (...args: any[]) => void): this;
        on(event: "groupsUp", listener: (groups: { id: string; groups: string[] }) => void): this;
        on(event: "groupsDown", listener: (groups: { id: string; groups: string[] }) => void): this;
    }

    const A: {
        new(): A;
    };

    export = A;
}