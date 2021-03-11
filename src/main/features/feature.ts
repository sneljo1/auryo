import { getTrackEntity, hasLiked, hasReposted } from '@common/store/selectors';
import { PlayerStatus, PlayingTrack } from '@common/store/types';
import { SoundCloud } from '@types';
import { StoreState, _StoreState } from 'AppReduxTypes';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, ipcMain } from 'electron';
import { isEqual } from 'lodash';
import { Store } from 'redux';
import { Observable } from 'rxjs';
import { distinctUntilChanged, distinctUntilKeyChanged, filter, map, pluck, withLatestFrom } from 'rxjs/operators';
// eslint-disable-next-line import/no-cycle
import { Auryo } from '../app';

export type Handler<T> = (t: {
  store: Store<StoreState>;
  selector: string | string[];
  prevState: StoreState;
  currentState: StoreState;
  prevValue: T;
  currentValue: T;
}) => void;

export interface WatchState<T> {
  store: Store<StoreState>;
  selector: string | string[];
  prevState: StoreState;
  currentState: StoreState;
  prevValue: T;
  currentValue: T;
}

type ObjectWithState<T> = { store: _StoreState; value: T };
type ObservableWithState<T> = Observable<ObjectWithState<T>>;

interface AuryoObservables {
  trackChanged: ObservableWithState<SoundCloud.Track>;
  statusChanged: ObservableWithState<PlayerStatus>;

  playingTrackLikeChanged: ObservableWithState<boolean>;
  playingTrackRepostChanged: ObservableWithState<boolean>;

  playerCurrentTimeChanged: ObservableWithState<number>;
  playerDurationChanged: ObservableWithState<number>;
}

export class Feature {
  public readonly featureName: string = 'Feature';
  public timers: any[] = [];
  public win: BrowserWindow | null = null;
  public store: Store<StoreState>;
  public watcher: any;
  public store$: Observable<StoreState>;
  public observables: AuryoObservables;
  private readonly listeners: { path: string[]; handler: Function }[] = [];
  private readonly ipclisteners: { name: string; handler: Function }[] = [];

  constructor(protected app: Auryo, protected waitUntil: string = 'default') {
    if (app.mainWindow) {
      this.win = app.mainWindow;
    }
    this.store = app.store;

    this.store$ = new Observable<StoreState>((observer) => {
      // emit the current state as first value:
      observer.next(app.store.getState());
      const unsubscribe = app.store.subscribe(() => {
        // emit on every new state changes
        observer.next(app.store.getState());
      });
      // let's return the function that will be called
      // when the Observable is unsubscribed
      return unsubscribe;
    });

    this.observables = this.registerObservables();
  }

  private registerObservables(): AuryoObservables {
    return {
      trackChanged: this.store$.pipe(
        pluck('player', 'playingTrack'),
        filter<PlayingTrack>(Boolean),
        distinctUntilChanged(),
        withLatestFrom(this.store$),
        map(([playingTrack, store]) => ({
          value: getTrackEntity(playingTrack.id)(store),
          store
        })),
        filter<ObjectWithState<SoundCloud.Track>>(({ value }) => !!value)
      ),
      statusChanged: this.store$.pipe(
        pluck('player', 'status'),
        filter<PlayerStatus>(Boolean),
        distinctUntilChanged(),
        withLatestFrom(this.store$),
        map(([value, store]) => ({
          value,
          store
        }))
      ),
      playingTrackLikeChanged: this.store$.pipe(
        distinctUntilChanged(
          ({ auth: authA, player: playerA }, { auth: authB, player: playerB }) =>
            authA.likes === authB.likes && playerA.playingTrack === playerB.playingTrack
        ),
        map((store) => ({
          value: store.player.playingTrack ? hasLiked(store.player.playingTrack.id, 'track')(store) : false,
          store
        })),
        distinctUntilKeyChanged('value')
      ),
      playingTrackRepostChanged: this.store$.pipe(
        distinctUntilChanged(
          ({ auth: authA, player: playerA }, { auth: authB, player: playerB }) =>
            authA.reposts === authB.reposts && playerA.playingTrack === playerB.playingTrack
        ),
        filter((store) => !!store.player.playingTrack),
        map((store) => ({
          value: hasReposted((store.player.playingTrack as PlayingTrack).id, 'track')(store),
          store
        })),
        distinctUntilKeyChanged('value')
      ),
      playerCurrentTimeChanged: this.store$.pipe(
        pluck('player', 'currentTime'),
        distinctUntilChanged(),
        withLatestFrom(this.store$),
        map(([value, store]) => ({
          value,
          store
        }))
      ),
      playerDurationChanged: this.store$.pipe(
        pluck('player', 'duration'),
        distinctUntilChanged(),
        withLatestFrom(this.store$),
        map(([value, store]) => ({
          value,
          store
        }))
      )
    };
  }

  public sendToWebContents(channel: string, params?: any) {
    if (this.win && this.win.webContents) {
      this.win.webContents.send(channel, params, this.constructor.name);
    }
  }

  public on(path: string, handler: any) {
    ipcMain.on(path, (_: any, ...args: any[]) => {
      handler(args);
    });

    this.ipclisteners.push({
      name: path,
      handler
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public register() {}

  public unregister(path?: string[] | string) {
    if (path) {
      const ipcListener = this.ipclisteners.find((l) => isEqual(l.name, path));

      if (typeof path === 'string') {
        if (ipcListener) {
          ipcMain.removeAllListeners(ipcListener.name);
        }
      }
    } else {
      this.ipclisteners.forEach((listener) => {
        ipcMain.removeAllListeners(listener.name);
      });
    }

    this.timers.forEach((timeout) => {
      clearTimeout(timeout);
    });
  }

  // eslint-disable-next-line
  public shouldRun() {
    return true;
  }
}
