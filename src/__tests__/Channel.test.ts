import Channel from '../utils/Channel';
import * as chBuzzr from './data/channel-BUZZR.json';

let channel: Channel = new Channel(chBuzzr);

beforeEach(() => {
  channel = new Channel(chBuzzr);
});

test('constructor', () => {
  expect(channel.channel.callSign).toBe('BUZZR');
  expect(channel.channel.callSignSrc).toBe('BUZZR');
});

test('get id', () => {
  expect(channel.id).toBe(982745);
});
