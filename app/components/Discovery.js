// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Api from '../utils/Tablo';
import RelativeDate from './RelativeDate';

const Store = require('electron-store');

const store = new Store();

type Props = { updateDevice: (info: Object) => void };
type State = {
  discovery: string,
  lastDevice: Object
};

export default class Discovery extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    const lastDevice = store.get('last_device');
    this.state = { discovery: '', lastDevice };
    (this: any).discover = this.discover.bind(this);
  }

  async componentDidMount() {
    if (!Api.device) {
      console.log('discover');
      await this.discover();
    }
  }

  async discover() {
    let device = await Api.discover();
    // TODO: this is roughly where we should allow selecting one of
    //  potentially  multiple devices
    // this also works below:  device = device[0];
    device = device.shift();

    if (Object.keys(device).length < 1) {
      this.setState({ discovery: 'error' });
    } else {
      Api.device = device;
      const info = await Api.getServerInfo();
      const { updateDevice } = this.props;
      updateDevice(info);
      setTimeout(() => {
        this.setState({ discovery: '' });
      }, 3000);
      this.setState({ discovery: 'success', lastDevice: info });
      store.set('last_device', info);
    }
  }

  render() {
    const { discovery, lastDevice } = this.state;

    return (
      <Container>
        <Row>
          <Col className="d-flex align-items-center">
            <DiscoveryTitle device={lastDevice} discover={this.discover} />
          </Col>
        </Row>
        <DiscoveryStatus status={discovery} />
      </Container>
    );
  }
}

/**
 * @return {string}
 */
function DiscoveryStatus(prop) {
  const { status } = prop;

  if (status === 'error') {
    return (
      <Alert variant="danger" className="fade m-2">
        Unable to find any Tablos
      </Alert>
    );
  }
  if (status === 'success') {
    return (
      <Alert variant="success" className="fade m-2">
        Found your Tablo!
      </Alert>
    );
  }
  return '';
}

function DiscoveryTitle(prop) {
  const { device, discover } = prop;

  let checked;
  if (device) {
    checked = new Date(device.checked);
    return (
      <>
        <span>
          Discovered: <RelativeDate date={checked} />
        </span>
        <Button onClick={discover} className="ml-auto mr-2" size="sm">
          Rediscover
        </Button>
      </>
    );
  }
  return (
    <>
      <span>None yet, click Discover</span>
      <Button onClick={discover} className="ml-auto mr-2" size="sm">
        Discover
      </Button>
    </>
  );
}
