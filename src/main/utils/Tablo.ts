import * as net from 'net';

// import * as Sentry from '@sentry/electron';
import compareVersions from 'compare-versions';
import Tablo from 'tablo-api';
import Store from 'electron-store';

import getConfig from './config';
import { setupDb } from './db';

const debug = require('debug')('tt:Tablo');

const store = new Store();
// const { store } = window.electron;
console.log('got store?');

export async function setCurrentDevice(
  device: any,
  publish = true
): Promise<void> {
  globalThis.Api.device = device;

  // if (!global.CONNECTED) {
  //   debug('setCurrentDevice - not connected, exiting...');
  //   return;
  // }

  if (device) {
    const currentDevice: any = store.get('CurrentDevice');
    debug('curdev = ', currentDevice);
    debug('newdev = ', device);

    if (currentDevice.serverid === device.serverid) {
      debug(
        'setCurrentDevice - current and new device are the same, exiting...'
      );
      return;
    }
    // Sentry.configureScope((scope) => {
    //   scope.setUser({
    //     id: device.server_id,
    //     username: device.name,
    //   });
    //   scope.setTag('tablo_host', device.host || 'unknown');
    //   scope.setTag('tablo_board', device.board);
    //   scope.setTag('tablo_firmware', device.server_version || 'unknown'); // scope.clear();
    // });
    store.set('CurrentDevice', device);
    setupDb();
    // if (publish) PubSub.publish('DEVICE_CHANGE', true);

    try {
      globalThis.Api.device.info = await globalThis.Api.get('/settings/info');
      debug(
        'setCurrentDevice - get Server Info: %O',
        globalThis.Api.device.info
      );
    } catch (e) {
      debug('Unable to load settings/info', e, globalThis.Api);
    }
  } else {
    console.warn(
      'sentry config - setCurrentDevice called without device!',
      device
    );
    store.delete('CurrentDevice');
  }
}

export const discover = async (): Promise<void> => {
  let deviceArray: Array<any> = [];
  let devices: Array<any> = [];

  try {
    // devices = await Tablo.discover();
    devices = await globalThis.Api.discover();
    deviceArray = Object.keys(devices).map(
      (i: string) => devices[parseInt(i, 10)]
    );
  } catch (e) {
    debug('discover(): Device Discovery failed %O', e);
  }
  // console.log('discover - getConfig?');
  const cfg = getConfig();
  // console.log('discover - gotConfig?', cfg);

  if (cfg.enableTestDevice) {
    let overDevice = {
      name: 'Test Device',
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
  // PubSub.publish('DEVLIST_CHANGE', true);
};

export async function checkConnection(): Promise<boolean> {
  const device: any = store.get('CurrentDevice');
  debug(
    'checkConnection - starting: %s',
    device ? 'has device' : 'no device, skipping'
  );
  if (!device || !device.private_ip) return false;
  const connIp = device.private_ip;
  const client = new net.Socket();
  const connTimeoutSec = 500;
  client.setTimeout(connTimeoutSec);
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
    .on('error', (evt: any) => {
      // if (!evt.toString().match(/ECONNREFUSED/)) {
      debug('checkConnection -  error - ', evt);
      //   status = false;
      // }

      status = false;
      client.end();
    })
    .on('timeout', (evt: any) => {
      // if (evt) {
      debug(`checkConnection - Timeout after ${connTimeoutSec}ms`);
      status = false;
      client.end();
      client.destroy();
    });
  // this is easily grosser and more wronger than it looks
  // OLDeslint-disable-next-line compat/compat
  return new Promise((resolve) => {
    client.on('close', () => {
      global.CONNECTED = status;
      resolve(status);
    });
  });
}

export const comskipAvailable = (): boolean => {
  const currentDevice: any = store.get('CurrentDevice');
  debug(
    'comskipAvailable: global.CONNECTED = %o    currentDevice = %O   globalThis.Api.device.info = %O',
    global.CONNECTED,
    currentDevice,
    globalThis.Api.device.info
  );

  if (!global.CONNECTED) return false;
  if (!currentDevice.server_version) return false;
  const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
  debug(
    'testVersion: %o , comparison: ',
    testVersion,
    compareVersions.compare(testVersion, '2.2.26', '>=')
  );

  if (!compareVersions.compare(testVersion, '2.2.26', '>=')) return false;

  if (globalThis.Api.device.info === 'undefined') {
  }
  if (
    globalThis.Api.device.info &&
    globalThis.Api.device.info.commercial_skip
  ) {
    return globalThis.Api.device.info.commercial_skip === 'on';
  }

  return false;
};

export async function setupApi(): Promise<void> {
  debug('Calling setupApi');
  globalThis.Api = new Tablo();
  global.CONNECTED = false;
  debug('Calling discover');
  await discover();
  debug('Discover finished');
  // TODO - updating to v0.0.7, remove in some time
  let currentDevice: any = store.get('CurrentDevice');
  debug('currentDevice', currentDevice);
  if (!currentDevice) {
    // eslint-disable-next-line prefer-destructuring
    currentDevice = global.discoveredDevices[0];
    // TODO - updating to v0.0.7, remove in some time
    store.delete('LastDevice');
    store.delete('last_device');
    store.delete('LastDbBuild');
    // localStorage.removeItem('LastDbBuild');
  }
  await checkConnection();
  // console.log('checked connection...');
  debug('checked connection...');
  setCurrentDevice(currentDevice, false);
  // console.log('set device?', currentDevice);
}
