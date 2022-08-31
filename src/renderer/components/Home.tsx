import React, { Component } from 'react';

import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import ServerInfoTable from './ServerInfoTable';
import DbStats from './DbStats';

import Discovery from './Discovery';
import { hasDevice } from '../utils/Tablo';
import DbLoadingTable from './DbLoadingTable';

import BuildTitle from './BuildTitle';

// const { ipcRenderer } = window.require('electron');

type Props = Record<string, any>;
type State = {
  showServerInfo: boolean;
  showDbTable: boolean;
};

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showDbTable: true,
      showServerInfo: true,
    };
    (this as any).showDbTable = this.showDbTable.bind(this);
    (this as any).showServerInfo = this.showServerInfo.bind(this);
  }

  showServerInfo(show: boolean) {
    const { showServerInfo } = this.state;

    if (show !== showServerInfo) {
      this.setState({
        showServerInfo: show,
      });
    }
  }

  showDbTable(show: boolean) {
    const { showDbTable } = this.state;

    if (show !== showDbTable) {
      this.setState({
        showDbTable: show,
      });
    }
  }

  render() {
    const { showServerInfo, showDbTable } = this.state;
    const appVersion = window.ipcRenderer.sendSync('get-version');

    if (!hasDevice()) {
      return (
        <Container>
          <Alert variant="primary">
            <h4 className="mb-2 pt-1">Welcome to Tablo Tools v{appVersion}</h4>
          </Alert>
          <Row>
            <Alert variant="danger">
              Uh-oh! It does not look like you have a network connection. Please
              check that and re-open this application.
            </Alert>
          </Row>
        </Container>
      );
    }

    return (
      <Container>
        <Alert variant="primary">
          <h4 className="mb-2 pt-1">Welcome to Tablo Tools v{appVersion}</h4>
        </Alert>

        <Row>
          <Col md="6">
            <Card className="device-card">
              <Card.Title className="mb-0">
                <Alert variant="dark">Current Tablo</Alert>
              </Card.Title>
              <Card.Subtitle className="text-muted">
                <Discovery showServerInfo={this.showServerInfo} />
              </Card.Subtitle>
              <Card.Body className="p-1">
                <div className="">
                  {showServerInfo ? <ServerInfoTable /> : ''}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Title className="mb-0">
                <Alert variant="dark">Recordings</Alert>
              </Card.Title>
              <Card.Subtitle className="pl-3 text-muted">
                <BuildTitle />
                <DbLoadingTable />
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
