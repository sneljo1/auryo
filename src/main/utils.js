/* eslint-disable no-param-reassign */
import { screen } from "electron";

export function posCenter(options) {

    const displays = screen.getAllDisplays();

    if (displays.length > 1) {
        const x = (displays[0].workArea.width - options.width) / 2;
        const y = (displays[0].workArea.height - options.height) / 2;
        options.x = x + displays[0].workArea.x;
        options.y = y + displays[0].workArea.y;
    }

    return options;
}

export async function installExtensions() {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require
    const extensions = [
        'REACT_DEVELOPER_TOOLS',
        'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    extensions.forEach(async (name) => {
        await installer.default(installer[name], forceDownload);
    })

}


