import net from 'net';
import PubSub from 'pubsub-js';
import * as Sentry from '@sentry/electron';
import Store from 'electron-store';

import Device from 'tablo-api/dist/Device';
import Tablo from 'tablo-api';
import compareVersions from 'compare-versions';
import getConfig from './config';

const store = new Store();

export function setCurrentDevice(device: Device, publish = true) {
  global.Api.device = device;

  if (device) {
    Sentry.configureScope((scope) => {
      scope.setUser({
        id: device.server_id,
        username: device.name,
      });
      scope.setTag('tablo_host', device.host || 'unknown');
      scope.setTag('tablo_board', device.board);
      scope.setTag('tablo_firmware', device.server_version || 'unknown'); // scope.clear();
    });
    store.set('CurrentDevice', device);
    if (publish) PubSub.publish('DEVICE_CHANGE', true);
  } else {
    console.warn(
      'sentry config - setCurrentDevice called without device!',
      device
    );
    store.delete('CurrentDevice');
  }

  global.Api.get('/settings/info')
    .then((info: any) => {
      global.Api.device.info = info;
      return 'why';
    })
    .catch((e: any) => {
      console.error('Unable to load settings/info', e);
    });
}

export const discover = async () => {
  let deviceArray: Array<Device> = [];
  let devices: Array<Device> = [];

  try {
    devices = await global.Api.discover();
    deviceArray = Object.keys(devices).map(
      (i: string) => devices[parseInt(i, 10)]
    );
  } catch (e) {
    console.warn('Device Discovery failed', e);
  }

  const cfg = getConfig();

  if (cfg.enableTestDevice) {
    let overDevice: Device = {
      board: 'test_dev',
      private_ip: '127.0.0.1',
      server_id: 'TID_testing',
      via: 'n/a',
      dev_type: 'test',
    };
    if (devices.length > 0) overDevice = { ...devices[0] };
    const fakeServerId = cfg.testDeviceIp.replace(/\./g, '-');
    overDevice.name = 'Test Device';
    overDevice.server_id = `TID_${fakeServerId}`;
    overDevice.private_ip = cfg.testDeviceIp;

    deviceArray.push(overDevice);
  }

  global.discoveredDevices = deviceArray;
  PubSub.publish('DEVLIST_CHANGE', true);
};

export async function setupApi() {
  global.Api = new Tablo();
  global.CONNECTED = false;
  await discover();
  // TODO - updating to v0.0.7, remove in some time
  let currentDevice: Device = store.get('CurrentDevice');

  if (!currentDevice) {
    // eslint-disable-next-line prefer-destructuring
    currentDevice = global.discoveredDevices[0];
    // TODO - updating to v0.0.7, remove in some time
    store.delete('LastDevice');
    store.delete('last_device');
    localStorage.removeItem('LastDbBuild');
  }

  setCurrentDevice(currentDevice, false);
}

export async function checkConnection() {
  const device = store.get('CurrentDevice');
  if (!device || !device.private_ip) return;
  const connIp = device.private_ip;
  // console.log('connIp', connIp);
  const client = new net.Socket();
  client.setTimeout(500);
  let status = false;
  client
    .connect(
      {
        port: 8885,
        host: connIp,
      },
      () => {
        status = true;
        client.end();
      }
    )
    .on('error', (evt) => {
      if (!evt.toString().match(/ECONNREFUSED/)) {
        console.log('error', evt);
      }

      status = false;
    })
    .on('timeout', (evt: any) => {
      if (evt) {
        console.log('timeout', evt);
        status = false;
      }
    });
  // this is easily grosser and more wronger than it looks
  return new Promise((resolve) => {
    client.on('close', () => {
      global.CONNECTED = status;
      // console.log('resolve status', status);
      resolve(status);
    });
  });
}
export const hasDevice = () => {
  const device = store.get('CurrentDevice');

  if (!device || !device.serverid) {
    console.warn("setupDb() - No device found, can't init db");
    return false;
  }

  return true;
};
export const comskipAvailable = () => {
  const currentDevice = store.get('CurrentDevice');
  if (!global.CONNECTED) return false;
  if (!currentDevice.server_version) return false;
  const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
  if (!compareVersions.compare(testVersion, '2.2.26', '>=')) return false;

  if (global.Api.device.info && global.Api.device.info.commercial_skip) {
    return global.Api.device.info.commercial_skip === 'on';
  }

  return false;
};
