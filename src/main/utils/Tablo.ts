import * as net from 'net';
import { compare } from 'compare-versions';
import Tablo from 'tablo-api';
import Store from 'electron-store';
import * as Sentry from '@sentry/electron/main';

import getConfig from './config';
import { setupDb } from './db';

import { mainDebug } from './logging';
import { asyncForEach } from './utils';

const debug = mainDebug.extend('Tablo');
globalThis.debugInstances.push(debug);

const store = new Store();

export async function setCurrentDevice(device: any): Promise<void> {
  globalThis.Api.device = device;

  if (device) {
    const currentDevice: any = store.get('CurrentDevice');
    debug('curdev = ', currentDevice);
    debug('newdev = ', device);

    // 0.3.10 - normalized on server_id and remove serverid. This converts old saved devices
    if (device.serverid && !device.server_id) {
      device.server_id = device.serverid;
      delete device.serverid;
    }

    const loadServerInfo = async () => {
      try {
        globalThis.Api.device.info = await globalThis.Api.get('/settings/info');
        debug(
          'setCurrentDevice - get Server Info: %O',
          globalThis.Api.device.info
        );
      } catch (e) {
        debug('Unable to load settings/info', e, globalThis.Api);
      }
    };

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
    await setupDb();
    await loadServerInfo();
  } else {
    console.warn(
      'sentry config - setCurrentDevice called without device!',
      device
    );
    store.delete('CurrentDevice');
  }
}

export const discover = async (): Promise<void> => {
  const deviceArray: Array<any> = [];
  let devices: Array<any> = [];

  try {
    devices = await globalThis.Api.discover();
    debug('devices', devices);
    const origDevice = globalThis.Api.device;

    await asyncForEach(devices, async (device: any) => {
      if (device.via === 'broadcast') {
        globalThis.Api.device = device;
        const info = await globalThis.Api.get('/server/info');
        debug('discover, bcast - device %O', device);
        debug('discover, bcast - info %O', info);

        globalThis.Api.device = origDevice;
        deviceArray.push({ ...device, ...info });
      } else {
        // this should have been fixed in setCurrentDevice
        // also probably should've gone with serverid instead of server_id
        // and done this change above and/or change the tablo-api-js pkg
        device.server_id = device.serverid;
        delete device.serverid;
        deviceArray.push(device);
      }
    });
  } catch (e) {
    debug('discover(): Device Discovery failed %O', e);
  }

  const cfg = getConfig();

  if (cfg.enableTestDevice) {
    const overDevice = {
      name: 'Test Device',
      board: 'test_dev',
      private_ip: '127.0.0.1',
      server_id: 'TID_testing',
      via: 'n/a',
      dev_type: 'test',
      inserted: Date.now(),
    };
    // if (devices.length > 0) overDevice = { ...devices[0] };
    const fakeServerId = cfg.testDeviceIp.replace(/\./g, '-');
    overDevice.name = 'Test Device';
    overDevice.server_id = `TID_${fakeServerId}`;
    overDevice.private_ip = cfg.testDeviceIp;

    deviceArray.push(overDevice);
  }

  global.discoveredDevices = deviceArray;
  await setupDb();
};

export async function checkConnection(): Promise<boolean> {
  const device: any = store.get('CurrentDevice');
  if (!device || !device.private_ip) {
    debug('checkConnection failed - device missing: %o', device);
    return false;
  }

  const connIp = device.private_ip;
  const client = new net.Socket();
  const connTimeoutSec = 750;
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
      debug('checkConnection -  error - ', evt);
      status = false;
      client.end();
    })
    .on('timeout', () => {
      debug(`checkConnection - Timeout after ${connTimeoutSec}ms`);
      status = false;
      client.end();
      client.destroy();
    });

  return new Promise((resolve) => {
    client.on('close', () => {
      global.CONNECTED = status;
      resolve(status);
    });
  });
}

export const comskipAvailable = (): boolean => {
  const currentDevice: any = store.get('CurrentDevice');

  if (!global.CONNECTED) return false;
  if (!currentDevice.server_version) return false;
  const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
  const supportedVersion = '2.2.26';
  debug(
    'comskipAvailable - has: %s , needs: %s, comparison: %o',
    testVersion,
    supportedVersion,
    compare(testVersion, supportedVersion, '>=')
  );

  if (!compare(testVersion, supportedVersion, '>=')) return false;

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
  setCurrentDevice(currentDevice);
  // console.log('set device?', currentDevice);
}
