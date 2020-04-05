import net from 'net';

import Tablo from 'tablo-api';
import getConfig from './config';

const Api = new Tablo();

const Store = require('electron-store');

const store = new Store();

const srvInfo = store.get('last_device');

const config = getConfig();

let ip;
if (srvInfo) {
  ip = srvInfo.local_address;
}

if (config && config.enableIpOverride) {
  ip = config.overrideIp;
}

if (srvInfo) {
  Api.device = {
    // private_ip: srvInfo.local_address,
    private_ip: ip
    // ip: '192.168.1.122',
    // srvInfo.server_id
  };
}

export function updateApi() {
  const cfg = getConfig();
  if (cfg.enableIpOverride) {
    Api.device = { private_ip: cfg.overrideIp };
  } else {
    Api.device = { private_ip: srvInfo.local_address };
  }
}

export async function checkConnection() {
  // console.log('in checkConnection');

  // const connIp = '127.0.0.1';
  if (!Api.device || !Api.device.private_ip) return;
  const connIp = Api.device.private_ip;

  // console.log('connIp', connIp);
  const client = new net.Socket();
  client.setTimeout(25000);
  let status = false;
  client
    .connect({ port: 8885, host: connIp }, () => {
      // console.log('client connected');
      status = true;
      client.end();
    })
    .on('error', evt => {
      console.log('error', evt);
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

export default Api;
