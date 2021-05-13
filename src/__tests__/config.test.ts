import fs from 'fs';

import getConfig, * as cfg from '../utils/config';

beforeEach(() => {
  try {
    fs.unlinkSync(cfg.CONFIG_FILE_NAME);
  } catch (e) {}
});

test('getConfig()', () => {
  expect(getConfig()).toEqual(cfg.defaultConfig);
});

test('setConfig()', () => {
  const modConfig = Object.assign({}, getConfig());

  const testVal = 'LALALALALALALALA';
  modConfig.movieTemplate = testVal;

  cfg.setConfig(modConfig);
  expect(getConfig()).toEqual(modConfig);
});

test('setConfigItem()', () => {
  const modConfig = Object.assign({}, getConfig());

  const testVal = { movieTemplate: 'LALALALALALALALA' };

  cfg.setConfigItem(testVal);

  expect(getConfig()).toEqual(modConfig);
});
