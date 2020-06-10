// @flow
import React, { Component } from 'react';
import { Player } from 'video-react';
import HLSSource from './HLSSource';
import Channel from '../utils/Channel';

type Props = { channel: Channel };
type State = { url: string };

export default class MyPlayerLive extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { url: '' };
  }

  async componentDidMount() {
    const { channel } = this.props;

    const watchPath = `${channel.path}/watch`;
    let data;
    try {
      data = await global.Api.post(watchPath);
    } catch (e) {
      console.warn(`Unable to load ${watchPath}`, e);
      throw new Error(e);
    }
    // TODO: better local/forward rewrites (probably elsewhere)
    if (global.Api.device.private_ip === '127.0.0.1') {
      const re = new RegExp(
        '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,5}'
      );
      data.playlist_url = data.playlist_url.replace(re, '127.0.0.1:8888');
    }
    await this.setState({ url: data.playlist_url });
  }

  render() {
    const { url } = this.state;
    console.debug('MyLivePlayer - url', url);
    if (!url) {
      return <div>Loading...</div>;
    }
    return (
      <Player fluid width={300} height={240}>
        <HLSSource isVideoChild src={url} video={{}} type="" />
      </Player>
    );
  }
}
