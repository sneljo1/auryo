import { Application, MediaController } from '@amilajack/castv2-client';

class AuryoReceiver extends Application {
  public static APP_ID = 'FD3FDD90';
  private media?: MediaController;

  constructor(client: any, session: any) {
    super(client, session);

    this.media = this.createController(MediaController);

    const onDisconnect = () => {
      this.emit('close', undefined);
    };

    const onStatus = (status: any) => {
      this.emit('status', status);
    };

    const onClose = async () => {
      if (this.media) {
        this.media.removeListener('disconnect', onDisconnect);
        this.media.removeListener('status', onStatus);
        this.media.close();
        this.media.stop();
      }
      this.media = undefined;
    };

    this.once('close', onClose);
    if (this.media) {
      this.media.on('status', onStatus);
      this.media.on('disconnect', onDisconnect);
    }
  }

  public getStatus() {
    if (this.media) {
      return this.media.getStatus();
    }

    return Promise.resolve();
  }

  public async load(media: any, options: any = {}) {
    if (this.media) {
      return this.media.load(media, options);
    }

    return null;
  }

  public play() {
    if (this.media) {
      return this.media.play();
    }

    return Promise.resolve();
  }

  public pause() {
    if (this.media) {
      return this.media.pause();
    }

    return Promise.resolve();
  }

  public stop() {
    if (this.media) {
      return this.media.stop();
    }

    return Promise.resolve();
  }

  public seek(currentTime: number) {
    if (this.media) {
      return this.media.seek(currentTime);
    }

    return Promise.resolve();
  }

  public queueLoad(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueLoad(items, options);
    }

    return Promise.resolve();
  }

  public queueInsert(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueInsert(items, options);
    }

    return Promise.resolve();
  }

  public queueRemove(itemIds: any, options: any = {}) {
    if (this.media) {
      return this.media.queueRemove(itemIds, options);
    }

    return Promise.resolve();
  }

  public queueReorder(itemIds: any, options: any = {}) {
    if (this.media) {
      return this.media.queueReorder(itemIds, options);
    }

    return Promise.resolve();
  }

  public queueUpdate(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueUpdate(items, options);
    }

    return Promise.resolve();
  }
}

export default AuryoReceiver;
