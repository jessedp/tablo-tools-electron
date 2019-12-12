// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

import ServerInfoTable from './ServerInfoTable';
import Api from '../utils/Tablo';
import DbInfoTable from './DbInfoTable';
import Build from './Build';
import Discovery from './Discovery';
import { writeToFile } from '../utils/utils';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  info: null;

  constructor() {
    super();
    // const lastDevice = store.get('last_device');
    this.state = { device: {}, showDbTable: true };
    // this.discover = this.discover.bind(this);
    this.showDbTable = this.showDbTable.bind(this);
    this.updateDevice = this.updateDevice.bind(this);
  }

  async componentDidMount() {
    if (!this.info) {
      try {
        this.info = await Api.getServerInfo();
        writeToFile('server-info.json', JSON.stringify(this.info));
      } catch (err) {
        this.info = 'Not Connected';
      }
    }
    this.setState({ device: this.info });
  }

  showDbTable(show) {
    const { showDbTable } = this.state;
    if (show !== showDbTable) {
      this.setState({ showDbTable: show });
    }
  }

  updateDevice(dev) {
    this.setState({ device: dev });
  }

  render() {
    const { device, showDbTable } = this.state;
    return (
      <Container>
        <Alert variant="primary">
          <h4 className="mb-2">Welcome to Tablo Tools!</h4>
          <Alert variant="light" className="m-0">
            Tablo Tools allows you different views of the recordings on your
            Tablo as well as options to delete and export your recordings.
          </Alert>
        </Alert>

        <Row>
          <Col md="6">
            <Card>
              <Card.Title className="mb-0">
                <Alert variant="dark">Current Tablo</Alert>
              </Card.Title>
              <Card.Subtitle className="text-muted">
                <Discovery updateDevice={this.updateDevice} />
              </Card.Subtitle>
              <Card.Body className="p-1">
                <ServerInfoTable device={device} />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Title className="mb-0">
                <Alert variant="dark">Recordings</Alert>
              </Card.Title>
              <Card.Subtitle className="text-muted">
                <Build showDbTable={this.showDbTable} />
              </Card.Subtitle>
              <Card.Body className="p-1">
                {showDbTable ? <DbInfoTable /> : ''}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
