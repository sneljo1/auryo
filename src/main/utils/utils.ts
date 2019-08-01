import { ProxyConfig } from "@common/store/config";
import { screen } from "electron";

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
}
