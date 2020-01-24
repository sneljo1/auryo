declare module "castv2" {
    import { EventEmitter } from "events";

    export class Client extends EventEmitter {
        connect(options: ConnectOptions, callback: () => void): void;
        close(): void;
        createChannel(
            sourceId: string,
            destinationId: string,
            namespace?: string,
            encoding?: string
        ): Channel;
    }
    export class Channel extends EventEmitter {
        send(data: any): void;
        close(): void;
    }

    export interface ConnectOptions {

    }

    export class Session {

    }
}