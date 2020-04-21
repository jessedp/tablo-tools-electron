// @flow
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PubSub from 'pubsub-js';
import ServerInfo from 'tablo-api/dist/ServerInfo';

const Store = require('electron-store');

const store = new Store();

type Props = {};
// TODO: type it
type State = { serverInfo: ServerInfo };

export default class ServerInfoTable extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor() {
    super();
    this.state = { serverInfo: {} };

    this.refresh = this.refresh.bind(this);
  }

  componentDidMount = async () => {
    this.psToken = PubSub.subscribe('DEVICE_CHANGE', this.refresh);
    await this.refresh();
  };

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    try {
      const serverInfo = await global.Api.getServerInfo();
      this.setState({ serverInfo });
    } catch (e) {
      console.error(e);
      this.setState({ serverInfo: {} });
    }
  };

  render() {
    let { serverInfo } = this.state;
    const device = store.get('CurrentDevice');

    // if (!device || Object.keys(serverInfo).length === 0 || !serverInfo) {
    if (!device) {
      return '';
    }
    if (!serverInfo) serverInfo = {};

    const { model } = serverInfo;

    return (
      <Table striped bordered size="sm" variant="">
        <tbody>
          <tr>
            <th>Tablo name</th>
            <td>{device.name} </td>
          </tr>
          <tr>
            <th>Server ID</th>
            <td>{device.serverid}</td>
          </tr>
          <tr>
            <th>Local IP</th>
            <td>{device.private_ip}</td>
          </tr>
          <tr>
            <th>Timezone</th>
            <td>{serverInfo.timezone}</td>
          </tr>
          <tr>
            <th>Firmware version</th>
            <td>{serverInfo.version}</td>
          </tr>
          {serverInfo.model ? (
            <tr>
              <td colSpan="2">
                <div className="mb-1">
                  <b>Model:</b> {model.name} - {model.type} - {model.device}
                </div>
                <Row className="p-1">
                  <Col md="2">Wifi</Col>
                  <Col>
                    {model.wifi ? (
                      <span className="fa fa-check-circle text-success" />
                    ) : (
                      <span className="fa fa-times-circle text-danger" />
                    )}
                  </Col>
                  <Col md="2">Tuners</Col>
                  <Col>{model.tuners}</Col>
                </Row>
              </td>
            </tr>
          ) : (
            <></>
          )}
        </tbody>
      </Table>
    );
  }
}
