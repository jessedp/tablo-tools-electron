import fs from 'fs';

import getConfig, * as cfg from '../renderer/utils/config.ts';

beforeEach(() => {
  fs.unlinkSync(cfg.CONFIG_FILE_NAME);
});

test('getConfig()', () => {
  expect(getConfig()).toEqual(cfg.defaultConfig);
});

test('setConfig()', () => {
  const modConfig = { ...getConfig() };

  const testVal = 'LALALALALALALALA';
  modConfig.movieTemplate = testVal;

  cfg.setConfig(modConfig);
  expect(getConfig()).toEqual(modConfig);
});

test('setConfigItem()', () => {
  const modConfig = { ...getConfig() };

  const testVal = { movieTemplate: 'LALALALALALALALA' };

  cfg.setConfigItem(testVal);

  expect(getConfig()).toEqual(modConfig);
});
