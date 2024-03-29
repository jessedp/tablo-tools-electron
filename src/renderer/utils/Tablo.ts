import Device from 'tablo-api/dist/src/Device';

export const discover = () => window.Tablo.discover();
export const hasDevice = () => window.Tablo.hasDevice();
export const checkConnection = () => window.Tablo.checkConnection();
export const comskipAvailable = () => window.Tablo.comskipAvailable();
export const setCurrentDevice = (device: Device) =>
  window.Tablo.setCurrentDevice(device);
