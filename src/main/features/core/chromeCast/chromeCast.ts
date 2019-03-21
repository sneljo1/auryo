import { PlatformSender, DefaultMediaReceiver } from '@amilajack/castv2-client';
import { addChromeCastDevices, ChromeCastDevice, setChromeCastPlayerStatus, DevicePlayerStatus } from '@common/store/app';
import { getTrackEntity } from '@common/store/entities/selectors';
import { SC } from '@common/utils';
import { Logger } from '@main/utils/logger';
import * as CastBrowser from 'mdns-cast-browser';
import * as equal from 'react-fast-compare';
import Feature, { WatchState } from '../../feature';
import { IMAGE_SIZES } from '@common/constants';
import { PlayerStatus } from '@common/store/player';
import { StoreState } from '@common/store';
import AuryoReceiver from './AuryoReceiver';
import { EVENTS } from '@common/constants/events';

export default class ChromeCast extends Feature {
  private logger = new Logger('ChromeCast');
  private player?: AuryoReceiver;
  private client?: PlatformSender;

  register() {

    const cb = new CastBrowser();

    cb.discover();

    const getDevices = () => this.getDevices(cb);

    this.getDevices(cb);

    cb.on('deviceChange', getDevices);
    cb.on('deviceUp', getDevices);
    cb.on('deviceDown', getDevices);
    cb.on('groupsDown', getDevices);
    cb.on('groupsUp', getDevices);

    this.subscribe(['app', 'chromecast', 'selectedDeviceId'], async ({ currentValue, currentState }: WatchState<string>) => {

      try {
        const {
          config: { audio: { volume } },
          player: { playingTrack }
        } = currentState;

        if (currentValue) {
          const d: ChromeCastDevice = cb.getDevice(currentValue).toObject();
          this.client = new PlatformSender();

          await this.client.connect({
            host: d.address.host,
            port: d.address.port,
          });

          await this.client.setVolume({ level: volume });

          this.player = await this.client.launch(AuryoReceiver);

          if (playingTrack) {
            await this.startTrack(currentState, true);
          }

        } else {
          if (this.client) {
            await this.client.close();
          }
        }


      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    this.subscribe(['player', 'playingTrack'], async ({ currentState }) => {
      try {

        if (this.player) {
          await this.startTrack(currentState);
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    // Handle volume change
    this.subscribe(['config', 'audio', 'volume'], async ({ currentValue }: WatchState<number>) => {
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
    this.subscribe(['config', 'audio', 'muted'], async ({ currentValue }: WatchState<boolean>) => {
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
    this.subscribe(['player', 'status'], async ({ currentValue }: WatchState<PlayerStatus>) => {
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
    this.on(EVENTS.PLAYER.SEEK_END, (args: Array<any>) => {
      const [to] = args;

      if (to && this.player) {
        this.player.seek(to);
      }

    });

  }

  unregister() {
    if (this.client) {
      this.client.close();
    }
  }

  private getDevices(cb: CastBrowser) {
    const allDevices = cb.getDevices();

    const devices: Array<ChromeCastDevice> = [];
    const groups: Array<ChromeCastDevice> = [];

    allDevices.forEach((device) => {
      const isGroup = allDevices.some((d) => d.groups.includes(device.id));

      if (isGroup) {
        groups.push(device);
      } else {
        devices.push(device);
      }
    });

    const { app: { chromecast: { devices: devicesInRedux, groups: groupsInRedux } } } = this.store.getState();

    if (!equal(devicesInRedux, devices) || !equal(groupsInRedux, groups)) {
      this.store.dispatch(addChromeCastDevices(devices, groups));
    }
  }

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
            // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: stream_url,
            contentType: 'audio/mp3',
            streamType: 'BUFFERED', // or LIVE

            // Title and cover displayed while buffering
            metadata: {
              type: 0,
              metadataType: 0,
              title: track.title.replace(/\s*\[.*?\]\s*/gi, ''),
              artist: track.user ? track.user.username : 'Unknown artist',
              images: [
                { url: SC.getImageUrl(track, IMAGE_SIZES.XSMALL) },
                { url: SC.getImageUrl(track, IMAGE_SIZES.XLARGE) }
              ]
            },
            customData: {
              nextTrack: nextTrack ? {
                title: nextTrack.title.replace(/\s*\[.*?\]\s*/gi, ''),
                artist: nextTrack.user ? nextTrack.user.username : 'Unknown artist',
                images: [
                  { url: SC.getImageUrl(nextTrack, IMAGE_SIZES.XSMALL) },
                  { url: SC.getImageUrl(nextTrack, IMAGE_SIZES.XLARGE) }
                ],
              } : null
            }
          };

          this.player.on('status', (status: any) => {
            this.store.dispatch(setChromeCastPlayerStatus(status.playerState));
          });

          this.logger.debug('app "%s" launched, loading media %s ...', this.player.session.displayName, media.contentId);

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
