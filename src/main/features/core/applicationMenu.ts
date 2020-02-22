import { EVENTS } from '@common/constants/events';
import { ChangeTypes, PlayerStatus, VolumeChangeTypes } from '@common/store/player';
import { setConfigKey, changeTrack, toggleStatus } from '@common/store/actions';
import * as SC from '@common/utils/soundcloudUtils';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, Menu, MenuItemConstructorOptions, shell } from 'electron';
import * as is from 'electron-is';
import { Feature } from '../feature';

@autobind
export default class ApplicationMenu extends Feature {
  public readonly featureName = 'ApplicationMenu';
  public shouldRun() {
    return is.osx();
  }

  public register() {
    this.on(EVENTS.APP.READY, () => {
      this.buildMenu();

      this.subscribe(['player', 'playingTrack'], () => {
        this.buildMenu();
      });

      this.subscribe(['player', 'status'], () => {
        this.buildMenu();
      });

      this.on(EVENTS.TRACK.LIKED, () => {
        this.buildMenu();
      });

      this.on(EVENTS.TRACK.REPOSTED, () => {
        this.buildMenu();
      });
    });
  }

  public buildMenu() {
    const { player } = this.store.getState();

    const template: MenuItemConstructorOptions[] = [
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
          } as any,
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
          } as any,
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
          } as any,
          {
            type: 'separator'
          },
          {
            label: 'Search',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
              if (this.win) {
                this.win.webContents.send('keydown:search');
              }
            }
          }
        ]
      },
      {
        label: 'Playback',
        submenu: [
          {
            label: !player || player.status !== PlayerStatus.PLAYING ? 'Play' : 'Pause',
            accelerator: 'Space',
            registerAccelerator: false,
            click: () => this.store.dispatch(toggleStatus() as any)
          },
          {
            type: 'separator'
          },
          {
            label: 'Next',
            accelerator: 'CmdOrCtrl+Right',
            click: () => this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any)
          },
          {
            label: 'Previous',
            accelerator: 'CmdOrCtrl+Left',
            click: () => this.store.dispatch(changeTrack(ChangeTypes.PREV) as any)
          },
          {
            type: 'separator'
          },
          {
            label: 'Volume up',
            accelerator: 'CmdOrCtrl+Up',
            click: () => this.changeVolume(VolumeChangeTypes.UP)
          },
          {
            label: 'Volume down',
            accelerator: 'CmdOrCtrl+Down',
            click: () => this.changeVolume(VolumeChangeTypes.DOWN)
          }
        ]
      },
      {
        label: 'Track',
        submenu: [
          {
            label: 'Like',
            accelerator: 'CmdOrCtrl+L',
            click: () => {
              const {
                player: { playingTrack }
              } = this.store.getState();

              if (playingTrack) {
                this.sendToWebContents(EVENTS.TRACK.LIKE, playingTrack.id);
              }
            },
            enabled: false
          },
          {
            label: 'Repost',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              const {
                player: { playingTrack }
              } = this.store.getState();

              if (playingTrack) {
                this.sendToWebContents(EVENTS.TRACK.REPOST, playingTrack.id);
              }
            },
            enabled: false
          }
        ]
      },
      {
        role: 'window',
        submenu: [{ role: 'close' }, { role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
      },
      {
        label: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Issues',
            click: () => shell.openExternal('https://github.com/Superjo149/auryo/issues')
          },
          {
            label: 'Donate',
            click: () => shell.openExternal('https://github.com/sponsors/Superjo149')
          },
          {
            label: 'Learn More',
            click: () => shell.openExternal('https://auryo.com')
          }
        ]
      }
    ];

    if (process.env.NODE_ENV === 'development') {
      (template[0].submenu as MenuItemConstructorOptions[]).push(
        {
          type: 'separator'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: (_item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        }
      );
    }

    if (process.platform === 'darwin') {
      template.unshift({
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.sendToWebContents(EVENTS.APP.PUSH_NAVIGATION, '/settings');
            }
          },
          { type: 'separator' },
          { role: 'services', submenu: [] },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ] as MenuItemConstructorOptions[]
      });
    }

    const {
      entities: { trackEntities },
      player: { playingTrack },
      auth: { likes, reposts }
    } = this.store.getState();

    if (playingTrack) {
      const trackId = playingTrack.id;
      const track = trackEntities[trackId];

      const index = template.findIndex(r => r.label === 'Track');

      if (trackId && track) {
        const liked = SC.hasID(track.id, likes.track);
        const reposted = SC.hasID(track.id, reposts.track);

        if (template[index]) {
          if (template[index].submenu) {
            const submenu: MenuItemConstructorOptions[] = template[index].submenu as MenuItemConstructorOptions[];
            (template[index].submenu as MenuItemConstructorOptions[]) = [
              ...submenu,
              {
                ...(submenu[0] || {}),
                label: liked ? 'Unlike' : 'Like',
                enabled: true
              },
              {
                ...(submenu[1] || {}),
                label: reposted ? 'Remove repost' : 'Repost',
                enabled: true
              }
            ];
          }
        }
      } else {
        (template[index].submenu as MenuItemConstructorOptions[]).map(s => {
          s.enabled = false; // eslint-disable-line

          return s;
        });
      }
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  private changeVolume(volumeChangeType: VolumeChangeTypes) {
    const {
      config: {
        audio: { volume }
      }
    } = this.store.getState();

    let newVolume = volume + 0.05;

    if (volumeChangeType === VolumeChangeTypes.DOWN) {
      newVolume = volume - 0.05;
    }

    if (newVolume > 1) {
      newVolume = 1;
    } else if (newVolume < 0) {
      newVolume = 0;
    }

    if (volume !== newVolume) {
      this.store.dispatch(setConfigKey('audio.volume', newVolume));
    }
  }
}
