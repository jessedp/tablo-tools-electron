import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactHlsPlayer from '@panelist/react-hls-player';

import { sendFlash } from 'renderer/store/flash';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';
import Airing from '../utils/Airing';

type Props = {
  airing: Airing;
};
type State = {
  opened: boolean;
  url: string;
};
export default class TabloVideoPlayer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opened: false,
      url: '',
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle = async () => {
    const { airing } = this.props;
    const { opened } = this.state;
    let { url } = this.state;

    if (!opened) {
      setTimeout(async () => {
        const watch = await airing.watch();
        if (watch && !url) url = watch.playlist_url;
        console.log('toggle - url', url);
        if (!url) {
          sendFlash({
            message: 'Unable to start playback',
            type: 'danger',
          });
        }
        this.setState({
          opened: !opened,
          url,
        });
      }, 10);
    } else {
      url = '';
    }
    this.setState({
      opened: !opened,
      url,
    });
  };

  render() {
    const { airing } = this.props;
    const { opened, url } = this.state;

    if (!opened && !url) {
      return (
        <Button
          variant="outline-secondary"
          size={'xs' as any}
          onClick={this.toggle}
          title="Play video"
        >
          <span className="fa fa-play-circle" />
        </Button>
      );
    }

    if (!url) {
      return (
        <Modal size="lg" show={opened} onHide={this.toggle} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {airing.showTitle} - {airing.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!airing.cachedWatch ? (
              <Row
                className="pt-3 pb-3 justify-content-center"
                style={{ width: '100%' }}
              >
                <Col md={5}>
                  <Spinner animation="border" size="sm" variant="secondary" />
                  <span className=" pl-3" style={{ fontSize: '16px' }}>
                    Loading...
                  </span>
                </Col>
              </Row>
            ) : (
              <Alert variant="danger">Unable to load video!</Alert>
            )}
          </Modal.Body>
        </Modal> //
      );
    }
    return (
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
            <ReactHlsPlayer
              src={url}
              autoPlay
              controls
              width="100%"
              height="auto"
            />
          )}
        </Modal.Body>
      </Modal> //
    );
  }
}
