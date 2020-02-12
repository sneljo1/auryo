import { StoreState } from '@common/store';
import { ChromeCastDevice } from '@common/store/app';
import { addChromeCastDevice, removeChromeCastDevice } from '@common/store/actions';
import createMdnsInterface from 'multicast-dns';
import { Store } from 'redux';
import { parseResponse } from './parseMdnsQuery';

interface MDNSHandler {
  onResponse(res: any): void;
}

let scanInterval: any = null;

const mdns = createMdnsInterface();
const handler: MDNSHandler = { onResponse: () => {} };
mdns.on('response', (res: any) => handler.onResponse(res));

export async function scanDevices(store: Store<StoreState>): Promise<void> {
  return new Promise(resolve => {
    const deviceUpdates: ChromeCastDevice[] = [];

    // update mDNS handler with this iteration's instance of deviceUpdates
    handler.onResponse = res => {
      const device = parseResponse(res);
      if (device && !deviceUpdates.find(d => d.id === device.id)) {
        // Add device to redux
        store.dispatch(addChromeCastDevice(device));
        deviceUpdates.push(device);
      }
    };

    mdns.query('._googlecast._tcp.local', 'ANY');

    // poll for 15 seconds
    setTimeout(async () => {
      const {
        app: {
          chromecast: { devices: previousDevices }
        }
      } = store.getState();

      const absentDevices = previousDevices.filter(
        d => !deviceUpdates.map(device => device.id).includes(d.id) && d.status === 'searching'
      );

      // ...and mark them as 'offline'
      absentDevices.forEach(device => {
        store.dispatch(removeChromeCastDevice(device.id));
      });

      // find all previously 'online' devices that aren't accounted for..
      const hidingDevices = previousDevices.filter(
        d => !deviceUpdates.map(device => device.id).includes(d.id) && d.status === 'online'
      );

      // ...and mark them as 'searching'
      hidingDevices.forEach(device => {
        store.dispatch(
          addChromeCastDevice({
            ...device,
            status: 'searching'
          })
        );
      });
      resolve();
    }, 15 * 1000);
  });
}

export async function startScanning(store: Store<StoreState>) {
  if (scanInterval) {
    clearInterval(scanInterval);
  }
  await scanDevices(store);
  // eslint-disable-next-line require-atomic-updates
  scanInterval = setInterval(() => scanDevices(store), 30000);
}
