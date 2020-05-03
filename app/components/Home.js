// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

import ServerInfoTable from './ServerInfoTable';
import DbStats from './DbStats';
import Build from './Build';
import Discovery from './Discovery';

const { app } = require('electron').remote;

type Props = {};
type State = {
  showServerInfo: boolean,
  showDbTable: boolean
};

export default class Home extends Component<Props, State> {
  props: Props;

  info: string;

  constructor() {
    super();
    this.state = { showDbTable: true, showServerInfo: true };

    (this: any).showDbTable = this.showDbTable.bind(this);
    (this: any).showServerInfo = this.showServerInfo.bind(this);
  }

  showServerInfo(show: boolean) {
    const { showServerInfo } = this.state;
    if (show !== showServerInfo) {
      this.setState({ showServerInfo: show });
    }
  }

  showDbTable(show: boolean) {
    const { showDbTable } = this.state;
    if (show !== showDbTable) {
      this.setState({ showDbTable: show });
    }
  }

  render() {
    const { showServerInfo, showDbTable } = this.state;

    const appVersion = app.getVersion();

    return (
      <Container>
        <Alert variant="primary">
          <h4 className="mb-2">Welcome to Tablo Tools v{appVersion}</h4>
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
                <Discovery showServerInfo={this.showServerInfo} />
              </Card.Subtitle>
              <Card.Body className="p-1">
                {showServerInfo ? <ServerInfoTable /> : ''}
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
                {showDbTable ? <DbStats /> : ''}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
