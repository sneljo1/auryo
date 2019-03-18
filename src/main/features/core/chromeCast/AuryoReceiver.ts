import { Application, MediaController } from '@amilajack/castv2-client';

class AuryoReceiver extends Application {

  public static APP_ID = 'FD3FDD90';
  private media?: MediaController;

  constructor(client: any, session: any) {
    super(client, session);
    this.APP_ID = 'FD3FDD90';

    /**
     * Media controller
     * @type {MediaController}
     */
    this.media = this.createController(MediaController);

    const onDisconnect = () => {
      this.emit('close', undefined);
    };

    const onStatus = (status: any) => {
      this.emit('status', status);
    };

    const onClose = () => {
      if (this.media) {
        this.media.removeListener('disconnect', onDisconnect);
        this.media.removeListener('status', onStatus);
        this.media.close();
      }
      this.media = undefined;
    };

    this.once('close', onClose);
    if (this.media) {
      this.media.on('status', onStatus);
      this.media.on('disconnect', onDisconnect);
    }
  }

  /**
   * Get the status
   * @returns {Promise}
   */
  getStatus() {
    if (this.media) {
      return this.media.getStatus();
    }
  }

  /**
   * Load a media object
   * @param {Object} media - Media to load
   * @param {Object} [options = {}] - Options
   * @returns {Promise}
   */
  load(media: any, options: any = {}) {
    if (this.media) {
      return this.media.load(media, options);
    }
  }

  /**
   * Play the media
   * @returns {Promise}
   */
  play() {
    if (this.media) {
      return this.media.play();
    }
  }

  /**
   * Pause the media
   * @returns {Promise}
   */
  pause() {
    if (this.media) {
      return this.media.pause();
    }
  }

  /**
   * Stop the media
   * @returns {Promise}
   */
  stop() {
    if (this.media) {
      return this.media.stop();
    }
  }

  /**
   * Seek through the media
   * @param {number} currentTime - Time to seek to
   */
  seek(currentTime: number) {
    if (this.media) {
      return this.media.seek(currentTime);
    }
  }

  /**
   * Load a queue of items to play (playlist)
   * @see https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.QueueLoadRequest
   * @param {Object[]} items - Items to load into the queue
   * @param {Object} options - Options
   * @returns {Promise}
   */
  queueLoad(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueLoad(items, options);
    }
  }

  /**
   * Insert items into the queue
   * @param {Object[]} items - Items to insert
   * @param {Object} options - Options
   * @returns {Promise}
   */
  queueInsert(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueInsert(items, options);
    }
  }

  /**
   * Remove items from the queue
   * @param {String[]} itemIds - IDs to remove
   * @param {Object} options - Options
   * @returns {Promise}
   */
  queueRemove(itemIds: any, options: any = {}) {
    if (this.media) {
      return this.media.queueRemove(itemIds, options);
    }
  }

  /**
   * Reorder the queue
   * @param {String[]} itemIds - IDs to reorder
   * @param {Object} options - Options
   * @returns {Promise}
   */
  queueReorder(itemIds: any, options: any = {}) {
    if (this.media) {
      return this.media.queueReorder(itemIds, options);
    }
  }

  /**
   * Update the queue
   * @param {Object[]} items - Items
   * @param {Object} options - Options
   * @returns {Promise}
   */
  queueUpdate(items: any, options: any = {}) {
    if (this.media) {
      return this.media.queueUpdate(items, options);
    }
  }

}

export default AuryoReceiver;
