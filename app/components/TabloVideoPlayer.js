// @flow
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

import Modal from 'react-bootstrap/Modal';
import MyPlayer from './MyPlayer';
import Airing from '../utils/Airing';

type Props = { airing: Airing };
type State = { opened: boolean };

export default class TabloVideoPlayer extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      opened: false
    };
    (this: any).toggle = this.toggle.bind(this);
  }

  toggle() {
    const { opened } = this.state;
    this.setState({
      opened: !opened
    });
  }

  render() {
    const { airing } = this.props;
    const { opened } = this.state;

    return (
      <>
        <Button
          variant="outline-secondary"
          size="xs"
          onClick={this.toggle}
          title="Play video"
        >
          <span className="fa fa-play-circle" />
        </Button>

        <Modal size="lg" show={opened} onHide={this.toggle} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {airing.showTitle} - {airing.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <MyPlayer airing={airing} />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
