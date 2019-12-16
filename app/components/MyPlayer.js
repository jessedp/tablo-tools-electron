// @flow
import React, { Component } from 'react';
import { Player } from 'video-react';
import HLSSource from './HLSSource';
import Airing from "../utils/Airing";

type Props = { airing: Airing };
type State = { url: string };

export default class MyPlayer extends Component<Props, State> {
  props: Props;

  state: State;

  constructor() {
    super();
    this.state = { url: '' };
  }

  async componentDidMount() {
    const { airing } = this.props;
    const watch = await airing.watch();
    console.debug('componentMount Watch Url:', watch.playlist_url);
    await this.setState({ url: watch.playlist_url });
  }

  render() {
    const { airing } = this.props;
    const { url } = this.state;
    console.debug('MyPlayer - cachedWatch', airing.cachedWatch);
    console.debug('MyPlayer - url', url);
    if (!airing.cachedWatch) {
      return <div>Loading...</div>;
    }
    return (
      <Player fluid width={300} height={240}>
        <HLSSource isVideoChild src={url} />
      </Player>
    );
  }
}
