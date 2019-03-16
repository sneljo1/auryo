import { Intent } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import { setConfigKey } from '@common/store/config';
import { addToast } from '@common/store/ui';
import { Auryo } from '@main/app';
import { Logger } from '@main/utils/logger';
import { shell } from 'electron';
import * as lastfm from 'lastfm';
import { CONFIG } from '../../../config';
import Feature, { WatchState } from '../feature';
import { getTrackEntity } from '@common/store/entities/selectors';
import { SC } from '@common/utils';
import debounce = require('lodash/debounce');
import { SoundCloud } from '../../../types';

export default class LastFm extends Feature {
  private logger = new Logger('LastFm');
  private lastfm: lastfm.LastFmNode;
  private scrobbleDebounced: (title: string, artist: string, timestamp: number) => void;

  constructor(auryo: Auryo) {
    super(auryo, 'ready-to-show');

    this.scrobbleDebounced = debounce(this.updateScrobble, 1000);
  }

  register() {

    try {
      this.lastfm = new lastfm.LastFmNode({
        api_key: CONFIG.LASTFM_API_KEY,
        secret: CONFIG.LASTFM_API_SECRET,
        useragent: 'auryo',
      });

    } catch (err) {
      console.error(err);
    }


    // track change
    this.subscribe(['player', 'playingTrack'], async ({ currentState }) => {
      try {

        const {
          player: { playingTrack },
          config: { lastfm }
        } = currentState;

        if (playingTrack && lastfm) {
          const trackId = playingTrack.id;
          const track = getTrackEntity(trackId)(currentState);

          if (track) {
            const [artist, title] = this.cleanInfo(track);
            await this.updateNowPlaying(title, artist);
          }
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    this.on(EVENTS.TRACK.LIKED, async (args: Array<any>) => {
      try {

        const currentState = this.store.getState();

        const {
          config: { lastfm },
          auth: { likes }
        } = currentState;

        const trackId = args[0];

        if (trackId && lastfm) {
          const track = getTrackEntity(trackId)(currentState);

          if (track) {
            const liked = SC.hasID(track.id, likes.track);

            const [artist, title] = this.cleanInfo(track);
            await this.updateLiked(liked, title, artist);
          }
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }


    });


    this.on(EVENTS.APP.LASTFM.AUTH, async () => {
      try {
        await this.getLastFMSession();
      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

    this.subscribe(['player', 'currentTime'], async ({ currentState }: WatchState<number>) => {
      try {

        const {
          player: { playingTrack, duration, currentTime },
          config: { lastfm }
        } = currentState;


        if (playingTrack && lastfm) {
          const trackId = playingTrack.id;
          const track = getTrackEntity(trackId)(currentState);

          if (track) {
            if (
              duration > 30 && // should be longer than 30s according to lastfm
              (
                (currentTime / duration) > 0.5 || // should have exceeded 1/2 of the song
                currentTime > 60 * 4) // or passed 4 minutes, whichever comes first
            ) {

              const [artist, title] = this.cleanInfo(track);
              await this.scrobbleDebounced(title, artist, Math.round((Date.now() / 1000) - currentTime));

            }

          }
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    });

  }

  updateNowPlaying = async (title: string, artist: string) => {
    try {

      const session = await this.getLastFMSession();

      this.logger.debug('nowplaying : ' + title + ' - ' + artist);

      this.lastfm
        .update('track.updateNowPlaying', session, {
          track: title,
          artist
        })
        .on('error', (track: any, err: any) => this.logger.error(err));

    } catch (err) {
      this.logger.error('Error updating nowPlaying');
      throw err;
    }
  }

  updateLiked = async (liked: boolean, title: string, artist: string) => {
    try {

      const session = await this.getLastFMSession();

      this.logger.debug(`track.${liked ? 'love' : 'unlove'}` + ' : ' + title + ' - ' + artist);

      this.lastfm
        .update(`track.${liked ? 'love' : 'unlove'}`, session, {
          track: title,
          artist,
        })
        .on('error', (track: any, err: any) => this.logger.error(err));

    } catch (err) {
      this.logger.error('Error updating updateLiked');
      throw err;
    }
  }

  updateScrobble = async (title: string, artist: string, timestamp: number) => {
    try {

      const session = await this.getLastFMSession();

      this.logger.debug('scrobble : ' + title + ' - ' + artist);

      this.lastfm
        .update('track.scrobble', session, {
          track: title,
          artist,
          timestamp
        })
        .on('error', (track: any, err: any) => this.logger.error(err));

    } catch (err) {
      this.logger.error('Error updating updateScrobble');
      throw err;
    }
  }

  newSession = async () => {

    try {
      const token = await this.getLastFMToken();

      shell.openExternal(`http://www.last.fm/api/auth/?api_key=${CONFIG.LASTFM_API_KEY}&token=${token}`);

      return new Promise((resolve, reject) => {
        this.lastfm
          .session({
            token
          } as any, undefined)
          .on('success', (session: any) => {

            this.store.dispatch(setConfigKey('lastfm.key', session.key));
            this.store.dispatch(setConfigKey('lastfm.user', session.user));

            this.store.dispatch(addToast({
              message: 'Lastfm connected successfully',
              intent: Intent.SUCCESS
            }));

            resolve(session);

          })
          .on('error', (_: any, err: any) => {
            this.store.dispatch(addToast({
              message: 'Something went wrong during authentication',
              intent: Intent.DANGER
            }));

            reject(err);
          });
      });
    } catch (err) {
      throw err;
    }
  }

  getLastFMSession = async () => {
    try {

      const { config: { lastfm: lastfmConfig } } = this.store.getState();

      if (lastfmConfig && lastfmConfig.user && lastfmConfig.key) {
        return this.lastfm.session(lastfmConfig.user, lastfmConfig.key);
      } else {
        return this.newSession();
      }

    } catch (err) {
      throw err;
    }
  }

  getLastFMToken() {
    return new Promise((resolve, reject) => {
      this.lastfm.request('auth.getToken', {})
        .on('success', (json: { token: string }) => {
          resolve(json.token);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  private cleanInfo(track: SoundCloud.Track): [string, string] {
    let artist = track.user && track.user.username ? track.user.username : 'Unknown artist';
    let title = track.title;

    if (track.title.match(/\s-\s|\s—\s|\s–\s/)) {
      const parts = track.title.split(/\s-\s|\s—\s|\s–\s/);
      if (parts && parts.length) {
        artist = parts.shift().trim();
        title = parts.join(' — ').trim();
      }
    }

    return [
      artist.replace(/\s*\[.*?\]\s*/gi, ''),
      title.replace(/\s*\[.*?\]\s*/gi, ''),
    ];


  }

}
