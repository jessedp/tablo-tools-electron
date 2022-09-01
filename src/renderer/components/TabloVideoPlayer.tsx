import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactHlsPlayer from '@panelist/react-hls-player';

import Airing from '../utils/Airing';

type Props = {
  airing: Airing;
};
type State = {
  opened: boolean;
  url: string;
};
export default class TabloVideoPlayer extends Component<Props, State> {
  // props: Props;

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
      const watch = await airing.watch();
      if (watch) url = watch.playlist_url;
    }

    this.setState({
      opened: !opened,
      url,
    });
  };

  render() {
    const { airing } = this.props;
    const { opened, url } = this.state;

    if (!opened) {
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
              <ReactHlsPlayer
                src={url}
                autoPlay
                controls
                width="100%"
                height="auto"
              />
            )}
          </Modal.Body>
        </Modal>
      </> //
    );
  }
}
