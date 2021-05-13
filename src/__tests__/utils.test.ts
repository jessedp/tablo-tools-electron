import * as util from '../utils/utils';

test('ellipse func', () => {
  expect(util.ellipse('not long enough', 50)).toBe('not long enough');
  expect(util.ellipse('exact length', 12)).toBe('exact length');
  expect(util.ellipse('please shorten me', 8)).toBe('please s...');
});

test('titlecase func', () => {
  expect(util.titleCase('wowsers')).toBe('Wowsers');
  expect(util.titleCase('WOWsERS')).toBe('Wowsers');
  expect(util.titleCase('holy moly')).toBe('Holy Moly');
  expect(util.titleCase('hOlY moLY')).toBe('Holy Moly');
});

test('readableBytes func', () => {
  expect(util.readableBytes(1000)).toBe('1000.00 B');
  expect(util.readableBytes(2000)).toBe('1.95 KB');
  expect(util.readableBytes(8675309)).toBe('8.27 MB');
  expect(util.readableBytes(10000000000)).toBe('9.31 GB');
});

test('secondsToTimeStr func', () => {
  expect(util.secondsToTimeStr('59')).toBe('000059');
  expect(util.secondsToTimeStr('59', ':')).toBe('00:00:59');
  expect(util.secondsToTimeStr('61')).toBe('000101');
  expect(util.secondsToTimeStr('61', ':')).toBe('00:01:01');
  expect(util.secondsToTimeStr('3601')).toBe('010001');
  expect(util.secondsToTimeStr('3601', ':')).toBe('01:00:01');
});

test('timeStrToSeconds func', () => {
  expect(util.timeStrToSeconds('00:00:59')).toBe(59);
  expect(util.timeStrToSeconds('00:01:59')).toBe(119);
  expect(util.timeStrToSeconds('01:01:59')).toBe(3719);
});

test('isValidIp func', () => {
  expect(util.isValidIp('192.168.1.10')).toBe(true);
  expect(util.isValidIp('10.20.10.30')).toBe(true);
  expect(util.isValidIp('8.8.8.8')).toBe(true);
  expect(util.isValidIp('152.136.21.500')).toBe(false);
});

test('boolStr fund', () => {
  expect(util.boolStr(true)).toBe('yes');
  expect(util.boolStr(false)).toBe('no');
  expect(util.boolStr('true')).toBe('no');
  expect(util.boolStr(0)).toBe('no');
  expect(util.boolStr(1)).toBe('no');
  expect(util.boolStr(8675309)).toBe('no');
});

test('readableDuration func', () => {
  expect(util.readableDuration(59)).toBe('00:59');
  expect(util.readableDuration(61)).toBe('01:01');
  expect(util.readableDuration(2350923)).toBe('5:02:03');
});
