import { ProxyConfig } from "@common/store/config";
import { app, screen } from "electron";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export namespace Utils {
	export function getProxyUrlFromConfig(proxy: ProxyConfig) {
		const port = proxy.port || 443;

		return `https://${proxy.username ? `${proxy.username}:${proxy.password}@` : ""}${proxy.host}:${port}`;
	}

	export function posCenter(options: { width?: number; height?: number; x?: number; y?: number }) {
		const displays = screen.getAllDisplays();

		if (displays.length > 1 && options.width && options.height) {
			const x = (displays[0].workArea.width - options.width) / 2;
			const y = (displays[0].workArea.height - options.height) / 2;
			options.x = x + displays[0].workArea.x;
			options.y = y + displays[0].workArea.y;
		}

		return options;
	}

	export function getLogDir() {
		const userData = app.getPath("userData");
		const appName = app.getName();

		const homeDir: string = os.homedir ? os.homedir() : process.env.HOME || "";

		let dir;
		switch (process.platform) {
			case "darwin": {
				dir = prepareDir(homeDir, "Library", "Logs", appName) ||
					prepareDir(userData) ||
					prepareDir(homeDir, "Library", "Application Support", appName);
				break;
			}

			case "win32": {
				dir = prepareDir(userData) ||
					prepareDir(process.env.APPDATA || "", appName) ||
					prepareDir(homeDir, "AppData", "Roaming", appName)
				break;
			}

			default: {
				dir = prepareDir(userData) ||
					prepareDir(process.env.XDG_CONFIG_HOME || "", appName) ||
					prepareDir(homeDir, ".config", appName) ||
					prepareDir(process.env.XDG_DATA_HOME || "", appName) ||
					prepareDir(homeDir, ".local", "share", appName);
			}
		}

		return dir;


		function prepareDir(dirPath: string, ...args: string[]) {
			// tslint:disable-next-line: no-invalid-this

			if (!dirPath) {
				return;
			}

			const fullPath: string = path.join(dirPath, ...args);

			// tslint:disable-next-line: non-literal-fs-path
			fs.mkdirSync(fullPath, { recursive: true });

			try {
				fs.accessSync(fullPath, 2);
			} catch (e) {
				return;
			}

			return fullPath;
		}
	}
}
