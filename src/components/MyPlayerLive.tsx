// @flow
import React, { Component } from 'react';
import { Player } from 'video-react';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import HLSSource from './HLSSource';
import Channel from '../utils/Channel';

type Props = { channel: Channel };
type State = { url: string, error: string };

export default class MyPlayerLive extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { url: '', error: '' };
  }

  async componentDidMount() {
    const { channel } = this.props;

    const watchPath = `${channel.path}/watch`;
    let data: any = null; // ugh
    let error = '';
    try {
      data = await global.Api.post(watchPath);
    } catch (e) {
      console.warn(`Unable to load ${watchPath}`, e);
      error = `${e}`;
    }

    let url = '';
    if (!error) {
      // TODO: better local/forward rewrites (probably elsewhere)
      if (global.Api.device.private_ip === '127.0.0.1') {
        const re = new RegExp(
          '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,5}'
        );
        url = data.playlist_url.replace(re, '127.0.0.1:8888');
      } else {
        url = data.playlist_url;
      }
    }
    await this.setState({ url, error });
  }

  render() {
    const { channel } = this.props;
    const { url, error } = this.state;
    console.debug('MyLivePlayer - url', url);
    if (!url) {
      return (
        <div>
          <Spinner variant="success" size="sm" animation="grow" />
          <span className="muted">Adjusting the rabbit ears...</span>
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="danger">
          Uh-oh, unable to load <b>${channel.channel.network}</b>{' '}
        </Alert>
      );
    }
    return (
      <Player fluid width={300} height={240}>
        <HLSSource isVideoChild src={url} video={{}} type="" />
      </Player>
    );
  }
}
