// @flow
import React, { Component } from 'react';
import compareVersions from 'compare-versions';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import DbInfoTable from './DbInfoTable';
import ServerInfoTable from './ServerInfoTable';

import { recDbCreated } from '../utils/db';
import RelativeDate from './RelativeDate';
import ComskipDetails from './ComskipDetails';

const Store = require('electron-store');

const store = new Store();

type Props = {};
type State = {
  currentDevice: Object
};

export default class Overview extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    const currentDevice = store.get('CurrentDevice');
    this.state = { currentDevice };
  }

  render() {
    const { currentDevice } = this.state;
    let checked = '';

    if (!currentDevice)
      return <Alert variant="warning">No device selected</Alert>;

    checked = new Date(currentDevice.inserted);

    let comskipAvailable = false;
    if (currentDevice.server_version) {
      const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
      comskipAvailable = compareVersions(testVersion, '2.2.26') >= 0;
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
          {comskipAvailable ? (
            <Col>
              <Alert variant="primary" className="p-2 m-0">
                Commercial Skip Stats
              </Alert>
              <ComskipDetails />
            </Col>
          ) : (
            ''
          )}
          <Col>
            <Alert variant="primary" className="p-2 m-0">
              Current Tablo
            </Alert>
            <ServerInfoTable />
          </Col>
        </Row>
      </Container>
    );
  }
}
