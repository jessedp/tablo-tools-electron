import net from 'net';
import PubSub from 'pubsub-js';
import * as Sentry from '@sentry/electron';

import Store from 'electron-store';

import Tablo from 'tablo-api';
import compareVersions from 'compare-versions';
import getConfig from './config';
import { dbCreatedKey } from './db';

const store = new Store();

export async function setupApi() {
  global.Api = new Tablo();
  global.CONNECTED = false;

  await discover();
  // TODO - updating to v0.0.7, remove in some time
  let currentDevice = store.get('CurrentDevice');
  if (!currentDevice || currentDevice[0] === true) {
    // eslint-disable-next-line prefer-destructuring
    currentDevice = global.discoveredDevices[0];
    setCurrentDevice(currentDevice, false);
    store.delete('LastDevice');
    store.delete('last_device');
    const lastBuild = localStorage.getItem('LastDbBuild');
    if (lastBuild) {
      localStorage.setItem(dbCreatedKey(), lastBuild);
    }
    localStorage.removeItem('LastDbBuild');
  } else {
    global.Api.device = store.get('CurrentDevice');
  }
}

export function setCurrentDevice(device, publish = true) {
  global.Api.device = device;
  if (device) {
    Sentry.configureScope(scope => {
      scope.setUser({ id: device.serverid, username: device.name });
      scope.setTag('tablo_host', device.host);
      scope.setTag('tablo_board', device.board);
      scope.setTag('tablo_firmware', device.server_version);
      // scope.clear();
    });
    store.set('CurrentDevice', device);
    if (publish) PubSub.publish('DEVICE_CHANGE', true);
  } else {
    console.error('setCurrentDevice called without device!', device);
    store.delete('CurrentDevice');
  }
}

export const discover = async () => {
  let deviceArray = [];
  let devices = [];
  try {
    devices = await global.Api.discover();
    deviceArray = Object.keys(devices).map(i => devices[i]);
  } catch (e) {
    console.warn('Device Discovery failed', e);
  }
  const cfg = getConfig();
  if (cfg.enableTestDevice) {
    let overDevice = {};
    if (devices.length > 0) overDevice = { ...devices[0] };

    const fakeServerId = cfg.testDeviceIp.replace(/\./g, '-');
    overDevice.name = 'Test Device';
    overDevice.serverid = `TID_${fakeServerId}`;
    overDevice.private_ip = cfg.testDeviceIp;
    deviceArray.push(overDevice);
  }

  global.discoveredDevices = deviceArray;
  PubSub.publish('DEVLIST_CHANGE', true);
};

export async function checkConnection() {
  const device = store.get('CurrentDevice');
  if (!device || !device.private_ip) return;
  const connIp = device.private_ip;

  // console.log('connIp', connIp);
  const client = new net.Socket();
  client.setTimeout(500);
  let status = false;
  client
    .connect({ port: 8885, host: connIp }, () => {
      status = true;
      client.end();
    })
    .on('error', evt => {
      if (!evt.toString().match(/ECONNREFUSED/)) {
        console.log('error', evt);
      }
      status = false;
    })
    .on('timeout', evt => {
      if (evt) {
        console.log('timeout', evt);
        status = false;
      }
    });

  // this is easily grosser and more wronger than it looks
  return new Promise(resolve => {
    client.on('close', () => {
      global.CONNECTED = status;
      // console.log('resolve status', status);
      resolve(status);
    });
  });
}

export const comskipAvailable = () => {
  const currentDevice = store.get('CurrentDevice');
  if (currentDevice.server_version) {
    const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
    return compareVersions(testVersion, '2.2.26') >= 0;
  }
  return false;
};
