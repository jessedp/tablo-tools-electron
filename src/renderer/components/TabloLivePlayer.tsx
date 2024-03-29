import { Component } from 'react';
import Modal from 'react-bootstrap/Modal';

import Button from 'react-bootstrap/Button';
import MyPlayerLive from './MyPlayerLive';
import Channel from '../utils/Channel';

type Props = {
  channel: Channel;
};
type State = {
  opened: boolean;
};
export default class TabloLivePlayer extends Component<Props, State> {
  // props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      opened: false,
    };
    (this as any).toggle = this.toggle.bind(this);
  }

  toggle() {
    const { opened } = this.state;
    this.setState({
      opened: !opened,
    });
  }

  render() {
    const { channel } = this.props;
    const { opened } = this.state;
    return (
      <>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={this.toggle}
          title="Watch Live"
        >
          <span className="fa fa-play-circle smallerish" />
        </Button>

        <Modal size="lg" show={opened} onHide={this.toggle} centered>
          <Modal.Header>
            <h5>{channel.channel.network}</h5>
          </Modal.Header>
          <Modal.Body>
            <MyPlayerLive channel={channel} />
          </Modal.Body>
        </Modal>
      </> //
    );
  }
}
