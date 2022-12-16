import { Component } from 'react';
import PubSub from 'pubsub-js';

import { RouteComponentProps, withRouter } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import { checkConnection, setCurrentDevice } from '../utils/Tablo';
import routes from '../constants/routes.json';

const { store } = window.electron;

type Props = {
  history: any;
};
type State = {
  pingInd: boolean;
};

class PingStatus extends Component<Props & RouteComponentProps, State> {
  timer: NodeJS.Timer | null;

  devListToken: string;

  devToken: string;

  constructor(props: Props & RouteComponentProps) {
    super(props);

    this.state = {
      pingInd: false,
    };
    this.timer = null;
    this.devListToken = '';
    this.devToken = '';
  }

  async componentDidMount() {
    const checkConn = async () => {
      const check = checkConnection();
      const { pingInd } = this.state;

      if (check !== pingInd) {
        this.setState({
          pingInd: check,
        });
      }
      return check;
    };

    this.devToken = PubSub.subscribe('DEVICE_CHANGE', this.checkConn);
    checkConn();
    this.timer = setInterval(checkConn, 5000);
    this.changeDevice = this.changeDevice.bind(this);
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    PubSub.unsubscribe(this.devToken);
    PubSub.unsubscribe(this.devListToken);
  }

  checkConn = async () => {
    const { pingInd } = this.state;
    const test = await checkConnection();
    if (pingInd !== test) {
      this.setState({
        pingInd: !!test,
      });
    }
  };

  changeDevice = (serverId: string | null) => {
    if (!serverId) return;

    const { history } = this.props;
    const device = window.Tablo.discoveredDevices().filter(
      (item: any) => item.server_id === serverId
    );
    setCurrentDevice(device[0]);
    PubSub.publish('DB_CHANGE', true);
    history.push(routes.HOME);
  };

  render() {
    const { pingInd } = this.state;
    const device = window.Tablo.device();
    const currentDevice: any = store.get('CurrentDevice');
    if (!device || !currentDevice) return <></>;

    let pingStatus = 'text-danger';

    if (pingInd) {
      pingStatus = 'text-success';
    }

    const discoveredDevices = window.Tablo.discoveredDevices();
    // TODO: this rerenders a ton on mouseovers? also not rediscovering, so...
    // console.log('discoveredDevices', discoveredDevices);
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
          <Dropdown.Toggle
            size={'xs' as any}
            variant="light"
            id="dropdown-basic"
          >
            {currentDevice.name}
            <span className={`d-inline pl-2 fa fa-circle ${pingStatus}`} />
          </Dropdown.Toggle>
          {discoveredDevices.length > 0 ? (
            <Dropdown.Menu>
              {discoveredDevices.map((dev: any) => {
                const key = `ping-status-${dev.server_id}`;
                return (
                  <Dropdown.Item
                    key={key}
                    onSelect={this.changeDevice}
                    eventKey={dev.server_id}
                  >
                    {dev.name} - {dev.private_ip}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          ) : (
            <></>
          )}
        </Dropdown>
      </>
    );
  }
}

export default withRouter(PingStatus);
