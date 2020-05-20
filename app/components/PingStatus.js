// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Store from 'electron-store';

import Dropdown from 'react-bootstrap/Dropdown';
import { checkConnection, setCurrentDevice } from '../utils/Tablo';

const store = new Store();

type PingProps = {};
type PingState = { pingInd: boolean };

export default class PingStatus extends Component<PingProps, PingState> {
  timer: IntervalID;

  devListToken: null;

  devToken: null;

  constructor() {
    super();
    this.state = { pingInd: false };
  }

  async componentDidMount() {
    const checkConn = async () => {
      const test = await checkConnection();
      //  console.log('conn: ', test);
      this.setState({ pingInd: test });
    };
    // this.devListToken = PubSub.subscribe('DEVLIST_CHANGE', this.updateDevices);
    this.devToken = PubSub.subscribe('DEVICE_CHANGE', this.checkConn);
    await checkConn();
    this.timer = setInterval(await checkConn, 5000);
    this.changeDevice = this.changeDevice.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    PubSub.unsubscribe(this.devToken);
    PubSub.unsubscribe(this.devListToken);
  }

  checkConn = async () => {
    const test = await checkConnection();
    //  console.log('conn: ', test);
    this.setState({ pingInd: test });
  };

  changeDevice = (serverId: {}) => {
    const device = global.discoveredDevices.filter(
      item => item.serverid === serverId
    );
    setCurrentDevice(device[0]);
  };

  render() {
    const { pingInd } = this.state;
    const { device } = global.Api;

    if (!device) return <></>;
    const currentDevice = store.get('CurrentDevice');

    let pingStatus = 'text-danger';
    if (pingInd) {
      pingStatus = 'text-success';
    }
    const { discoveredDevices } = global;
    if (!device && discoveredDevices.length === 1) {
      return (
        <span title={device.private_ip}>
          <span className="d-inline text-muted smaller pr-2">
            {device.name}
          </span>
          <span className={`d-inline fa fa-circle ${pingStatus}`} />
        </span>
      );
    }
    return (
      <>
        <Dropdown>
          <Dropdown.Toggle size="xs" variant="light" id="dropdown-basic">
            {currentDevice.name}{' '}
            <span className={`d-inline pl-2 fa fa-circle ${pingStatus}`} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {discoveredDevices.map(dev => {
              const key = `ping-status-${dev.serverid}`;
              return (
                <Dropdown.Item
                  key={key}
                  onSelect={this.changeDevice}
                  eventKey={dev.serverid}
                >
                  {dev.name} - {dev.private_ip}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}
