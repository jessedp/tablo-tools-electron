// @flow
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

import Modal from 'react-bootstrap/Modal';

import { Player } from 'video-react';
import HLSSource from './HLSSource';

// import MyPlayer from './MyPlayer';
import Airing from '../utils/Airing';

type Props = { airing: Airing };
type State = { opened: boolean, url: string };

export default class TabloVideoPlayer extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      opened: false,
      url: ''
    };
    (this: any).toggle = this.toggle.bind(this);
  }

  toggle = async () => {
    const { airing } = this.props;
    const { opened } = this.state;
    let { url } = this.state;

    if (!opened) {
      const watch = await airing.watch();
      url = watch.playlist_url;
    }
    this.setState({ opened: !opened, url });
  };

  render() {
    const { airing } = this.props;
    const { opened, url } = this.state;

    if (!opened) {
      return (
        <Button
          variant="outline-secondary"
          size="xs"
          onClick={this.toggle}
          title="Play video"
        >
          <span className="fa fa-play-circle" />
        </Button>
      );
    }

    return (
      <>
        <Modal size="lg" show={opened} onHide={this.toggle} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {airing.showTitle} - {airing.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!airing.cachedWatch ? (
              <div>Loading...</div>
            ) : (
              <Player fluid width={300} height={240}>
                <HLSSource isVideoChild src={url} video={{}} type="" />
              </Player>
            )}
          </Modal.Body>
        </Modal>
      </> //
    );
  }
}
