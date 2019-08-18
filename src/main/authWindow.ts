import { BrowserWindow, Menu, nativeImage, session } from "electron";
import * as os from "os";
import * as path from "path";

const logosPath = process.env.NODE_ENV === "development" ?
    path.resolve(__dirname, "..", "..", "..", "assets", "img", "logos") :
    path.resolve(__dirname, "./assets/img/logos");

const icons = {
    256: nativeImage.createFromPath(path.join(logosPath, "auryo.png")),
    128: nativeImage.createFromPath(path.join(logosPath, "auryo-128.png")),
    64: nativeImage.createFromPath(path.join(logosPath, "auryo-64.png")),
    48: nativeImage.createFromPath(path.join(logosPath, "auryo-48.png")),
    32: nativeImage.createFromPath(path.join(logosPath, "auryo-32.png")),
    ico: nativeImage.createFromPath(path.join(logosPath, "auryo.ico")),
    tray: nativeImage.createFromPath(path.join(logosPath, "auryo-tray.png")).resize({ width: 24, height: 24 }),
    "tray-ico": nativeImage.createFromPath(path.join(logosPath, "auryo-tray.ico")).resize({ width: 24, height: 24 })
};

let authWindow: BrowserWindow | null = null;

export const hasAuthWindow = () => !!authWindow;

export const createAuthWindow = () => {
    try {
        // const sess = session.fromPartition(`authWindow-soundcloud`);

        authWindow = new BrowserWindow({
            show: false,
            icon: os.platform() === "win32" ? icons.ico : icons["256"],
            width: 600,
            height: 800,
            webPreferences: {
                // session: sess,
                nodeIntegration: false, // We recommend disabling nodeIntegration for security.
                contextIsolation: true, // We recommend enabling contextIsolation for security.
                // see https://github.com/electron/electron/blob/master/docs/tutorial/security.md
            },
        })

        authWindow.setMenu(null);

        authWindow.once("ready-to-show", () => {
            if (authWindow) {
                authWindow.show()
            }
        })

        authWindow.on("closed", async () => {
            authWindow = null;
        })

        if ((process.env.NODE_ENV === "development" || process.env.ENV === "development")) {
            authWindow.webContents.on("context-menu", (_e, props) => {
                if (authWindow) {
                    const { x, y } = props;
                    Menu.buildFromTemplate([
                        {
                            label: "Inspect element",
                            click: () => {
                                if (authWindow) {
                                    authWindow.webContents.inspectElement(x, y);
                                }
                            }
                        },
                        {
                            label: "Reload",
                            click: () => {
                                if (authWindow) {
                                    authWindow.reload();
                                }
                            }
                        }
                    ]).popup({ window: authWindow });
                }
            });

            if (process.env.OPEN_DEVTOOLS) {
                authWindow.webContents.openDevTools();
            }
        }

        return authWindow;
    } catch (err) {
        throw err;
    }
}
