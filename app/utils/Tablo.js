import net from 'net';
import PubSub from 'pubsub-js';

import Store from 'electron-store';

import Tablo from 'tablo-api';
import getConfig from './config';
import { dbCreatedKey } from './db';

const store = new Store();

export async function setupApi() {
  global.Api = new Tablo();

  await discover();
  // TODO - updating to v0.0.7, remove in some time
  const currentDevice = store.get('CurrentDevice');
  if (!currentDevice) {
    const oldDevice = store.get('last_device');
    if (global.discoveredDevices.length > 0) {
      let newDevice;
      if (oldDevice)
        newDevice = global.discoveredDevices.map(
          item => item.serverid === oldDevice.server_id
        );
      // eslint-disable-next-line prefer-destructuring
      if (!newDevice) newDevice = global.discoveredDevices[0];
      setCurrentDevice(newDevice, false);
      store.delete('LastDevice');
      store.delete('last_device');
      const lastBuild = localStorage.getItem('LastDbBuild');
      localStorage.setItem(dbCreatedKey(), lastBuild);
    }
  } else {
    global.Api.device = store.get('CurrentDevice');
  }
}

export function setCurrentDevice(device, publish = true) {
  global.Api.device = device;
  store.set('CurrentDevice', device);
  if (publish) PubSub.publish('DEVICE_CHANGE', true);
}

export const discover = async () => {
  const devices = await global.Api.discover();
  const deviceArray = Object.keys(devices).map(i => devices[i]);

  const cfg = getConfig();
  if (cfg.enableTestDevice) {
    const overDevice = { ...devices[0] };
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
      // console.log('resolve status', status);
      resolve(status);
    });
  });
}
