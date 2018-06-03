import IFeature from './IFeature'
import { app, Menu, shell } from 'electron'
import { CHANGE_TYPES, PLAYER_STATUS, VOLUME_TYPES } from '../../renderer/modules/player/constants/player'
import * as SC from '../../shared/utils/soundcloudUtils'
import { EVENTS } from '../../shared/constants/events'

export default class ApplicationMenu extends IFeature {

    constructor(app) {
        super(app)

        this.buildMenu = this.buildMenu.bind(this)
    }

    register() {
        this.buildMenu()

        const store = this.store

        this.on(EVENTS.APP.READY, () => {

            this.subscribe(['player', 'playingTrack'], () => {

                const { player } = store.getState()
                this.buildMenu(player)

            })

            this.subscribe(['player', 'status'], () => {

                const { player } = store.getState()
                this.buildMenu(player)

            })

            this.on(EVENTS.TRACK.LIKED, () => {

                const { player } = store.getState()
                this.buildMenu(player)

            })

            this.on(EVENTS.TRACK.REPOSTED, () => {

                const { player } = store.getState()
                this.buildMenu(player)

            })
        })
    }

    buildMenu(player) {
        const _this = this

        const template = [
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
                    { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                    { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                    { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Search',
                        accelerator: 'CmdOrCtrl+F',
                        click: () => _this.win.webContents.send('keydown:search')
                    }
                ]
            },
            {
                label: 'Playback',
                role: 'playback',
                submenu: [
                    {
                        label: !player || player.status !== PLAYER_STATUS.PLAYING ? 'Play' : 'Pause',
                        accelerator: 'CmdOrCtrl+Shift+Space',
                        click: () => _this.router.send(EVENTS.PLAYER.TOGGLE_STATUS)
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Next',
                        accelerator: 'CmdOrCtrl+Right',
                        click: () => _this.router.send(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.NEXT)
                    },
                    {
                        label: 'Previous',
                        accelerator: 'CmdOrCtrl+Left',
                        click: () => _this.router.send(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.PREV)
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Volume up',
                        accelerator: 'CmdOrCtrl+Up',
                        click: () => _this.router.send(EVENTS.PLAYER.CHANGE_VOLUME, VOLUME_TYPES.UP)
                    },
                    {
                        label: 'Volume down',
                        accelerator: 'CmdOrCtrl+Down',
                        click: () => _this.router.send(EVENTS.PLAYER.CHANGE_VOLUME, VOLUME_TYPES.DOWN)
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
                        click: () => _this.router.send(EVENTS.TRACK.LIKE, playingTrack.id),
                        enabled: false
                    },
                    {
                        label: 'Repost',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => _this.router.send(EVENTS.TRACK.REPOST, playingTrack.id),
                        enabled: false
                    }
                ]
            },
            {
                role: 'window',
                submenu: [
                    { role: 'close' },
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { type: 'separator' },
                    { role: 'front' }
                ]
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
                        click: () => shell.openExternal('http://auryo.com#donate')
                    },
                    {
                        label: 'Learn More',
                        click: () => shell.openExternal('http://auryo.com')
                    }
                ]
            }
        ]

        if (process.env.NODE_ENV === 'development') {
            template[0].submenu.push(
                {
                    type: 'separator'
                }, {
                    label: 'Toggle Developer Tools',
                    accelerator: (() => {
                        if (process.platform === 'darwin') return 'Alt+Command+I'
                        return 'Ctrl+Shift+I'
                    })(),
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.toggleDevTools()
                    }
                }
            )
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

                            _this.win.webContents.send('navigate', {
                                pathname: '/settings',
                                search: '',
                                hash: '',
                                action: 'PUSH',
                                key: 'settings'
                            })

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
            })
        }

        const {
            entities: {
                track_entities
            },
            player: {
                playingTrack
            },
            auth: {
                likes,
                reposts
            }
        } = this.store.getState()

        if (playingTrack) {
            const trackID = playingTrack.id
            const track = track_entities[trackID]


            const index = template.findIndex(r => r.role === 'track')

            if (trackID && track) {
                const liked = SC.hasID(track.id, likes.track)
                const reposted = SC.hasID(track.id, reposts)


                template[index].submenu[0].label = liked ? 'Unlike' : 'Like'
                template[index].submenu[0].enabled = true

                template[index].submenu[1].label = reposted ? 'Remove repost' : 'Repost'
                template[index].submenu[1].enabled = true

            } else {
                template[index].submenu.forEach(s => s.enabled = false)
            }
        }

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }

    unregister() {
    }

}