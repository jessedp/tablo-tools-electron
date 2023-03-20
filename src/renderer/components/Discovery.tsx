import { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import PubSub from 'pubsub-js';
import { Spinner } from 'react-bootstrap';
import { discover, setCurrentDevice } from '../utils/Tablo';
import RelativeDate from './RelativeDate';

const { store } = window.electron;
type Props = {
  showServerInfo: (show: boolean) => void;
};
type State = {
  state: number;
  currentDevice: Record<string, any>;
};
const STATE_NONE = 0;
const STATE_SELECTED = 1;
const STATE_MULTI = 2;
const STATE_WORKING = 3;

function DiscoveryStatus(prop: Record<string, any>) {
  const { state, setDevice } = prop;

  if (state === STATE_WORKING) {
    return <Spinner animation="grow" variant="success" />;
  }

  if (state === STATE_NONE) {
    return (
      <Alert variant="danger" className="fade m-2">
        No Tablos found.
      </Alert>
    );
  }

  if (state === STATE_MULTI) {
    const discoveredDevices = window.Tablo.discoveredDevices();
    return (
      <div className="m-2">
        <div className="p-2 mb-2 bg-success text-white">
          Found {discoveredDevices.length} devices
        </div>
        {discoveredDevices.map((device: any, i: string) => {
          const serverId = device.server_id;
          const key = `select-device-${i}`;
          return (
            <Row className="p-1 pb-2 mb-2 border" key={key}>
              <Col md="2">
                <Button size={'xs' as any} onClick={() => setDevice(serverId)}>
                  use
                </Button>
              </Col>
              <Col>
                <div>
                  {device.name ? (
                    <span>
                      <b>{device.name}</b> ({device.private_ip})
                    </span>
                  ) : (
                    <b>{device.private_ip}</b>
                  )}
                </div>
              </Col>
              <br />
            </Row>
          );
        })}
      </div>
    );
  }

  return <></>;
}

function DiscoveryTitle(prop: Record<string, any>) {
  const { device, localDiscover, state } = prop;
  let checked;
  if (window.Tablo.CONNECTED()) {
    if (state === STATE_MULTI) return <></>;
    checked = device?.inserted ? new Date(device.inserted) : '';
    return (
      <>
        {checked ? (
          <span>
            Since: <RelativeDate date={checked} />{' '}
          </span>
        ) : (
          ''
        )}
        <Button onClick={localDiscover} className="ml-auto mr-2" size="sm">
          Rediscover
        </Button>
      </>
    );
  }

  return (
    <>
      <span>No devices found yet, click Discover</span>
      <Button onClick={localDiscover} className="ml-auto mr-2" size="sm">
        Discover
      </Button>
    </>
  );
}

export default class Discovery extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    const device: any = store.get('CurrentDevice');
    this.state = {
      state: device ? STATE_SELECTED : STATE_NONE,
      currentDevice: device,
    };
    this.psToken = '';
    (this as any).discover = this.discover.bind(this);
    (this as any).setDevice = this.setDevice.bind(this);
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    const { showServerInfo } = this.props;
    const { state } = this.state;
    if (state === STATE_SELECTED) showServerInfo(true);
    this.psToken = PubSub.subscribe('DEVICE_CHANGE', this.refresh);
  }

  componentWillUnmount(): any {
    PubSub.unsubscribe(this.psToken);
  }

  setDevice = async (serverId: string) => {
    const { showServerInfo } = this.props;
    const device = window.Tablo.discoveredDevices().filter(
      (item: any) => item.server_id === serverId
    );
    await setCurrentDevice(device[0]);

    showServerInfo(true);
    this.setState({
      state: STATE_SELECTED,
      currentDevice: device[0],
    });
    PubSub.publish('DB_CHANGE', true);
  };

  async refresh() {
    const device: any = store.get('CurrentDevice');
    this.setState({
      state: STATE_SELECTED,
      currentDevice: device,
    });
  }

  async discover() {
    const { showServerInfo } = this.props;
    this.setState({
      state: STATE_WORKING,
    });

    await discover();
    const devices = window.Tablo.discoveredDevices();

    if (devices.length < 1) {
      this.setState({
        state: STATE_NONE,
      });
      showServerInfo(false);
    } else {
      store.set('Devices', devices);

      if (devices.length === 1) {
        await this.setDevice(devices[0].server_id);
        showServerInfo(true);
      } else {
        showServerInfo(false);
        this.setState({
          state: STATE_MULTI,
        });
      }
    }
  }

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
