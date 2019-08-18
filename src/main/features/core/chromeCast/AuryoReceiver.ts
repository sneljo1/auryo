import { Application, MediaController } from "@amilajack/castv2-client";

class AuryoReceiver extends Application {

  public static APP_ID: string = "FD3FDD90";
  private media?: MediaController;

  constructor(client: any, session: any) {
    super(client, session);

    this.media = this.createController(MediaController);

    const onDisconnect = () => {
      this.emit("close", undefined);
    };

    const onStatus = (status: any) => {
      this.emit("status", status);
    };

    const onClose = async () => {
      if (this.media) {
        this.media.removeListener("disconnect", onDisconnect);
        this.media.removeListener("status", onStatus);
        this.media.close();
        this.media.stop();
      }
      this.media = undefined;
    };

    this.once("close", onClose);
    if (this.media) {
      this.media.on("status", onStatus);
      this.media.on("disconnect", onDisconnect);
    }
  }

  public getStatus() {
    if (this.media) {
      return this.media.getStatus();
    }
  }

  public async load(media: any, options: any = {}) {
    if (this.media) {
      return this.media.load(media, options);
    }
  }


  public play() {
    if (this.media) {
      return this.media.play();
    }
  }

  public pause() {
    if (this.media) {
      return this.media.pause();
    }
  }

  public stop() {
    if (this.media) {
      return this.media.stop();
    }
  }


  public seek(currentTime: number) {
    if (this.media) {
      return this.media.seek(currentTime);
    }
  }

  public queueLoad(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueLoad(items, options);
    }
  }

  public queueInsert(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueInsert(items, options);
    }
  }

  public queueRemove(itemIds: any, options: any = {}) {
    if (this.media) {
      return this.media.queueRemove(itemIds, options);
    }
  }

  public queueReorder(itemIds: any, options: any = {}) {
    if (this.media) {
      return this.media.queueReorder(itemIds, options);
    }
  }

  public queueUpdate(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueUpdate(items, options);
    }
  }

}

export default AuryoReceiver;
