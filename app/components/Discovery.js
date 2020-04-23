// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import PubSub from 'pubsub-js';
import { discover, setCurrentDevice } from '../utils/Tablo';
import RelativeDate from './RelativeDate';

const Store = require('electron-store');

const store = new Store();

type Props = { showServerInfo: (show: boolean) => void };
type State = {
  state: number,
  currentDevice: Object
};

const STATE_NONE = 0;
const STATE_SELECTED = 1;
const STATE_MULTI = 2;

export default class Discovery extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor() {
    super();
    const device = store.get('CurrentDevice');
    this.state = {
      state: device ? STATE_SELECTED : STATE_NONE,
      currentDevice: device
    };

    (this: any).discover = this.discover.bind(this);
    (this: any).setDevice = this.setDevice.bind(this);
    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    const { showServerInfo } = this.props;
    const { state } = this.state;
    if (state === STATE_SELECTED) showServerInfo(true);
    this.psToken = PubSub.subscribe('DEVICE_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    const device = store.get('CurrentDevice');
    this.setState({
      state: STATE_SELECTED,
      currentDevice: device
    });
  }

  async discover() {
    const { showServerInfo } = this.props;
    await discover();
    const devices = global.discoveredDevices;
    if (devices.length < 1) {
      this.setState({ state: STATE_NONE });
      showServerInfo(false);
    } else {
      store.set('Devices', devices);
      if (devices.length === 1) {
        this.setDevice(devices[0].serverid);
        showServerInfo(true);
      } else {
        showServerInfo(false);
        this.setState({ state: STATE_MULTI });
      }
    }
  }

  setDevice = (serverId: string) => {
    const { showServerInfo } = this.props;
    const device = global.discoveredDevices.filter(
      item => item.serverid === serverId
    );
    setCurrentDevice(device[0]);
    showServerInfo(true);
    this.setState({ state: STATE_SELECTED, currentDevice: device[0] });
  };

  render() {
    const { state, currentDevice } = this.state;

    return (
      <Container>
        <Row>
          <Col className="d-flex align-items-center">
            <DiscoveryTitle
              state={state}
              device={currentDevice}
              localDiscover={this.discover}
            />
          </Col>
        </Row>
        <DiscoveryStatus state={state} setDevice={this.setDevice} />
      </Container>
    );
  }
}

function DiscoveryStatus(prop) {
  const { state, setDevice } = prop;

  if (state === STATE_NONE) {
    return (
      <Alert variant="danger" className="fade m-2">
        Unable to find any Tablos
      </Alert>
    );
  }

  if (state === STATE_MULTI) {
    const { discoveredDevices } = global;
    return (
      <div className="m-2">
        <div className="p-2 mb-2 bg-success text-white">
          Found {discoveredDevices.length} devices
        </div>
        {discoveredDevices.map((device, i) => {
          const serverId = device.serverid;
          const key = `select-device-${i}`;
          return (
            <Row className="p-1 pb-2 mb-2 border" key={key}>
              <Col md="2">
                <Button size="xs" onClick={() => setDevice(serverId)}>
                  use
                </Button>
              </Col>
              <Col>
                <div>
                  <b>{device.name}</b> ({device.private_ip})
                </div>
              </Col>
              <br />
            </Row>
          );
        })}
      </div>
    );
  }
  // if (state === STATE_SELECTED)
  return <></>;
}

function DiscoveryTitle(prop) {
  const { device, localDiscover, state } = prop;

  let checked;
  if (device) {
    if (state === STATE_MULTI) return <></>;
    checked = new Date(device.inserted);
    return (
      <>
        <span>
          Since: <RelativeDate date={checked} />
        </span>
        <Button onClick={localDiscover} className="ml-auto mr-2" size="sm">
          Rediscover
        </Button>
      </>
    );
  }
  return (
    <>
      <span>None yet, click Discover</span>
      <Button onClick={localDiscover} className="ml-auto mr-2" size="sm">
        Discover
      </Button>
    </>
  );
}
