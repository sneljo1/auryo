import { PlatformSender } from "@amilajack/castv2-client";
import { Intent } from "@blueprintjs/core";
import { IMAGE_SIZES } from "@common/constants";
import { EVENTS } from "@common/constants/events";
import { StoreState } from "@common/store";
import { DevicePlayerStatus, setChromecastAppState, setChromeCastPlayerStatus, useChromeCast } from "@common/store/app";
import { getTrackEntity } from "@common/store/entities/selectors";
import { PlayerStatus } from "@common/store/player";
import { addToast } from "@common/store/ui";
import { SC } from "@common/utils";
import { Logger, LoggerInstance } from "@main/utils/logger";
import { autobind } from "core-decorators";
import { Feature, WatchState } from "../../feature";
import AuryoReceiver from "./auryoReceiver";
import { startScanning } from "./deviceScanner";


@autobind
export default class ChromecastManager extends Feature {

  private readonly logger: LoggerInstance = Logger.createLogger(ChromecastManager.name);

  private player?: AuryoReceiver;
  private client?: PlatformSender;

  public shouldRun() {
    return false;
  }

  // tslint:disable-next-line: max-func-body-length
  public register() {

    this.subscribe(["app", "chromecast", "selectedDeviceId"], async ({ currentValue, currentState }: WatchState<string>) => {

      try {
        const {
          config: { audio: { volume } },
          player: { playingTrack },
          app: {
            chromecast: {
              devices
            }
          }
        } = currentState;


        if (this.client && this.player) {
          await this.client.stop(this.player);
          this.player.removeAllListeners();
          this.player = undefined;
          this.client.removeAllListeners();
          this.client = undefined;
          this.store.dispatch(setChromecastAppState(null));
        }

        if (currentValue) {
          const device = devices.find((d) => d.id === currentValue);

          if (!device) {
            return;
          }

          if (!this.client) {

            this.client = new PlatformSender();

            this.client.on("error", async (err: any) => {
              this.logger.error(err);
              this.store.dispatch(addToast({
                message: `An error occurred during the connection with the cast device`,
                intent: Intent.DANGER
              }));

              if (this.client && this.client.connection) {
                await this.client.close();
              }

              this.store.dispatch(useChromeCast());
            });

            this.client.on("status", this.handleClientStatusChange);
          }

          await this.client.connect({
            host: device.address,
            port: device.port,
          });

          this.player = await this.client.launch(AuryoReceiver);

          await this.client.setVolume({ level: volume });

          if (playingTrack) {
            await this.startTrack(currentState, true);
          }

        }

      } catch (err) {
        this.logger.error(err);
        this.store.dispatch(setChromecastAppState(null));
        this.store.dispatch(useChromeCast());
        throw err;
      }
    });

    this.subscribe(["player", "playingTrack"], async ({ currentState }) => {
      try {

        if (this.client && this.player) {
          await this.startTrack(currentState);
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    // Handle volume change
    this.subscribe(["config", "audio", "volume"], async ({ currentValue }: WatchState<number>) => {
      try {

        if (this.client) {
          await this.client.setVolume({ level: currentValue });
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    // Handle mute
    this.subscribe(["config", "audio", "muted"], async ({ currentValue }: WatchState<boolean>) => {
      try {

        if (this.client) {
          await this.client.setVolume({ muted: currentValue });
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    // Handle status change
    this.subscribe(["player", "status"], async ({ currentValue }: WatchState<PlayerStatus>) => {
      try {
        if (this.player) {
          const status: any = this.player.getStatus();

          if (status) {
            const deviceStatus: DevicePlayerStatus = status.playerState;

            switch (currentValue) {
              case PlayerStatus.PAUSED: {
                if (deviceStatus !== DevicePlayerStatus.PAUSED) {
                  this.player.pause();
                }
                break;
              }
              case PlayerStatus.PLAYING: {
                if (deviceStatus !== DevicePlayerStatus.PLAYING) {
                  this.player.play();
                }
                break;
              }
              case PlayerStatus.STOPPED: {
                if (deviceStatus !== DevicePlayerStatus.IDLE) {
                  this.player.stop();
                }
                break;
              }
              default:
            }
          }
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    // Handle seek
    this.on(EVENTS.PLAYER.SEEK_END, (args: any[]) => {
      const [to] = args;

      if (to && this.player) {
        this.player.seek(to);
      }

    });

    this.on(EVENTS.APP.READY, async () => {
      await startScanning(this.store);
    });

  }

  public async unregister() {
    if (this.client) {
      await this.client.close();
    }
  }

  private handleClientStatusChange(status: any) {
    if (status.applications) {
      const auryoReceiverApp = status.applications.find((a: any) => a.displayName === "Auryo");

      if (auryoReceiverApp) {
        this.store.dispatch(setChromecastAppState({
          appId: auryoReceiverApp.appId,
          displayName: auryoReceiverApp.displayName,
          launchedFromCloud: auryoReceiverApp.launchedFromCloud,
          sessionId: auryoReceiverApp.sessionId,
          transportId: auryoReceiverApp.transportId
        }));
      } else {
        this.store.dispatch(setChromecastAppState(null));
        this.store.dispatch(useChromeCast());
      }
    }
  }

  // private getDevices(timeout: number = 2500) {
  //   if (!this.isSearching) {

  //     this.logger.debug("Starting search...");

  //     const browser = mdns.createBrowser(mdns.getLibrary().tcp("googlecast"));

  //     const withTimeout = () => {
  //       this.logger.debug("Browser ready, waiting", timeout);
  //       setTimeout(() => {
  //         browser.removeAllListeners();

  //         this.logger.debug("Browser timeout finished, found ", this.devices.length)

  //         this.devices = [];
  //         this.isSearching = false;
  //       }, timeout);
  //     }

  //     this.isSearching = true;

  //     if (browser.ready) {
  //       browser.browse();
  //       withTimeout();
  //     } else {
  //       browser.once("ready", () => {
  //         browser.browse();
  //         withTimeout();
  //       });
  //     }

  //     browser.on("serviceUp", (data: any) => {
  //       if (!this.devices.some((d) => d.id === data.fullname) && data.txtRecord.fn) {
  //         this.logger.debug("Found new device", data.fullname);
  //         this.devices.push({
  //           id: data.fullname,
  //           name: data.txtRecord.fn,
  //           address: {
  //             host: data.addresses[0],
  //             port: data.port
  //           }
  //         });
  //         this.store.dispatch(addChromeCastDevices(this.devices));
  //       }
  //     });

  //     browser.on("serviceDown", (data: any) => {
  //       const index = this.devices.findIndex((d) => d.id === data.fullname);
  //       if (index !== -1) {
  //         this.devices.splice(index, 1);
  //         this.store.dispatch(addChromeCastDevices(this.devices));
  //       }
  //     });

  //   }
  // }

  private async startTrack(state: StoreState, fromCurrentTime: boolean = false) {
    try {
      const {
        player: { playingTrack, currentTime, status, currentIndex, queue },
        config: { app: { overrideClientId } }
      } = state;

      if (playingTrack && this.player) {
        const trackId = playingTrack.id;
        const track = getTrackEntity(trackId)(state);
        const nextTrackId = queue[currentIndex + 1];
        const nextTrack = nextTrackId && nextTrackId.id ? getTrackEntity(nextTrackId.id)(state) : null;

        if (track) {
          const stream_url = track.stream_url ?
            SC.appendClientId(track.stream_url, overrideClientId) :
            SC.appendClientId(`${track.uri}/stream`, overrideClientId);

          const media = {
            contentId: stream_url,
            contentType: "audio/mp3",
            streamType: "BUFFERED", // or LIVE

            // Title and cover displayed while buffering
            metadata: {
              type: 0,
              metadataType: 0,
              title: track.title.replace(/\s*\[.*?\]\s*/gi, ""),
              artist: track.user ? track.user.username : "Unknown artist",
              images: [
                { url: SC.getImageUrl(track, IMAGE_SIZES.XSMALL) },
                { url: SC.getImageUrl(track, IMAGE_SIZES.XLARGE) }
              ]
            },
            customData: {
              nextTrack: nextTrack ? {
                title: nextTrack.title.replace(/\s*\[.*?\]\s*/gi, ""),
                artist: nextTrack.user ? nextTrack.user.username : "Unknown artist",
                images: [
                  { url: SC.getImageUrl(nextTrack, IMAGE_SIZES.XSMALL) },
                  { url: SC.getImageUrl(nextTrack, IMAGE_SIZES.XLARGE) }
                ],
              } : null
            }
          };

          this.player.on("status", (status: any) => {
            this.store.dispatch(setChromeCastPlayerStatus(status.playerState));
          });

          const options: any = {
            autoplay: status === PlayerStatus.PLAYING
          };

          if (fromCurrentTime) {
            options.currentTime = currentTime;
          }

          await this.player.load(media, options);
        }
      }
    } catch (err) {
      throw err;
    }
  }

}
