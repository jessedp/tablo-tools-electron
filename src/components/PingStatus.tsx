import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Store from 'electron-store';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import { checkConnection, setCurrentDevice } from '../utils/Tablo';
import routes from '../constants/routes.json';

const store = new Store();
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
      checkConnection()
        .then((resp) => {
          this.setState({
            pingInd: !!resp,
          });
          return !!resp;
        })
        .catch((_: any) => {
          this.setState({
            pingInd: false,
          });
        });
      // const test = await checkConnection();
      // //  console.log('conn: ', test);
      // this.setState({
      //   pingInd: test,
      // });
    };

    // this.devListToken = PubSub.subscribe('DEVLIST_CHANGE', this.updateDevices);
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
    const test = await checkConnection();
    //  console.log('conn: ', test);
    this.setState({
      pingInd: !!test,
    });
  };

  changeDevice = (serverId: string | null) => {
    if (!serverId) return;

    const { history } = this.props;
    const device = global.discoveredDevices.filter(
      (item) => item.server_id === serverId
    );
    setCurrentDevice(device[0]);
    history.push(routes.HOME);
  };

  render() {
    const { pingInd } = this.state;
    const { device } = global.Api;
    if (!device) return <></>; //

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
          <Dropdown.Toggle
            size={'xs' as any}
            variant="light"
            id="dropdown-basic"
          >
            {currentDevice.name}
            <span className={`d-inline pl-2 fa fa-circle ${pingStatus}`} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {discoveredDevices.map((dev) => {
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
      </> //
    );
  }
}

export default withRouter(PingStatus);
