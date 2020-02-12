declare module 'electron-dl' {

    namespace ElectronDl {

        type ElectronDlOptions = {
            unregisterWhenDone: boolean;
            directory?: string;
        }

        function download(window: Electron.BrowserWindow, url: string, options: ElectronDlOptions): Promise<Electron.DownloadItem>;

    }

    export = ElectronDl;
}