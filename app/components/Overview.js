// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import DbInfoTable from './DbInfoTable';
import ServerInfoTable from './ServerInfoTable';

import Api from '../utils/Tablo';
import { recDbCreated } from '../utils/db';
import RelativeDate from './RelativeDate';
import ComskipDetails from './ComskipDetails';

const Store = require('electron-store');

const store = new Store();

type Props = {};

export default class Overview extends Component<Props> {
  props: Props;

  info: null;

  constructor() {
    super();
    const lastDevice = store.get('last_device');
    this.state = { device: {}, lastDevice };
  }

  async componentDidMount() {
    if (!this.info) {
      this.info = await Api.getServerInfo();
    }
    this.setState({ device: this.info });
  }

  render() {
    const { device, lastDevice } = this.state;
    let checked;
    if (lastDevice) {
      checked = new Date(lastDevice.checked);
    }

    return (
      <Container>
        <Row className="p-2 m-2 border bg-light">
          <Col>
            Last Device Found: <RelativeDate date={checked} />
          </Col>
          <Col>
            DB Built: <RelativeDate date={recDbCreated()} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Alert variant="primary" className="p-2 m-0">
              Recordings
            </Alert>
            <DbInfoTable />
          </Col>
          <Col>
            <Alert variant="primary" className="p-2 m-0">
              Commercial Skip Stats
            </Alert>
            <ComskipDetails />
          </Col>
          <Col>
            <Alert variant="primary" className="p-2 m-0">
              Current Tablo
            </Alert>
            <ServerInfoTable device={device} />
          </Col>
        </Row>
      </Container>
    );
  }
}
