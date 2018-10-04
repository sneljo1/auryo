import { app, Menu, shell, MenuItemConstructorOptions } from 'electron';
import { EVENTS } from '../../shared/constants/events';
import * as SC from '../../shared/utils/soundcloudUtils';
import Feature from './feature';
import { PlayerStatus, ChangeTypes, PlayerState, VolumeChangeTypes } from '../../shared/store/player';
import { show } from 'redux-modal';

export default class ApplicationMenu extends Feature {
  register() {
    this.on(EVENTS.APP.READY, () => {
      const { player } = this.store.getState();
      this.buildMenu(player);

      this.subscribe(['player', 'playingTrack'], () => {
        const { player } = this.store.getState();
        this.buildMenu(player);
      });

      this.subscribe(['player', 'status'], () => {
        const { player } = this.store.getState();
        this.buildMenu(player);
      });

      this.on(EVENTS.TRACK.LIKED, () => {
        const { player } = this.store.getState();
        this.buildMenu(player);
      });

      this.on(EVENTS.TRACK.REPOSTED, () => {
        const { player } = this.store.getState();
        this.buildMenu(player);
      });
    });
  }

  buildMenu = (player: PlayerState) => {

    const template: Array<MenuItemConstructorOptions> = [
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
        role: 'edit',
        submenu: [
          { label: 'Cut', accelerator: 'CmdOrCtrl+X' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V' },
          {
            type: 'separator'
          },
          {
            label: 'Search',
            accelerator: 'CmdOrCtrl+F',
            click: () => this.win.webContents.send('keydown:search')
          }
        ]
      },
      {
        label: 'Playback',
        role: 'playback',
        submenu: [
          {
            label: !player || player.status !== PlayerStatus.PLAYING ? 'Play' : 'Pause',
            accelerator: 'CmdOrCtrl+Shift+Space',
            click: () => this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS)
          },
          {
            type: 'separator'
          },
          {
            label: 'Next',
            accelerator: 'CmdOrCtrl+Right',
            click: () => this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.NEXT)
          },
          {
            label: 'Previous',
            accelerator: 'CmdOrCtrl+Left',
            click: () => this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.PREV)
          },
          {
            type: 'separator'
          },
          {
            label: 'Volume up',
            accelerator: 'CmdOrCtrl+Up',
            click: () => this.sendToWebContents(EVENTS.PLAYER.CHANGE_VOLUME, VolumeChangeTypes.UP)
          },
          {
            label: 'Volume down',
            accelerator: 'CmdOrCtrl+Down',
            click: () => this.sendToWebContents(EVENTS.PLAYER.CHANGE_VOLUME, VolumeChangeTypes.DOWN)
          }
        ]
      },
      {
        label: 'Track',
        role: 'track',
        submenu: [
          {
            label: 'Like',
            accelerator: 'CmdOrCtrl+L',
            click: () => {
              const { player: { playingTrack } } = this.store.getState();

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
              const { player: { playingTrack } } = this.store.getState();

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
            click: () => shell.openExternal('https://opencollective.com/auryo')
          },
          {
            label: 'Learn More',
            click: () => shell.openExternal('http://auryo.com')
          }
        ]
      }
    ];

    if (process.env.NODE_ENV === 'development') {
      (template[0].submenu as Array<MenuItemConstructorOptions>).push(
        {
          type: 'separator'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: (_item, focusedWindow) => {
            if (focusedWindow) { focusedWindow.webContents.toggleDevTools(); }
          }
        }
      );
    }

    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            role: 'preferences',
            click: () => {
              this.store.dispatch(show('utilities', {
                activeTab: 'settings'
              }));
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
        ]
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

      const index = template.findIndex((r) => r.role === 'track');

      if (trackId && track) {
        const liked = SC.hasID(track.id, likes.track);
        const reposted = SC.hasID(track.id, reposts);

        if (template[index]) {
          if (template[index].submenu) {
            const submenu: Array<MenuItemConstructorOptions> = template[index].submenu as Array<MenuItemConstructorOptions>

              ; (template[index].submenu as Array<MenuItemConstructorOptions>) = [
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
        (template[index].submenu as Array<MenuItemConstructorOptions>).map((s) => {
          s.enabled = false; // eslint-disable-line

          return s;
        });
      }
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
}
