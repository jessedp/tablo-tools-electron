import { Component } from 'react';

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
import LogoBox from './Logo';

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
            <Col md="10">
              <Alert variant="danger" width="100%">
                <strong>Uh-oh!</strong> No Tablo device could be found!
              </Alert>
            </Col>
            <Col className="ml-5" md="8">
              <Discovery showServerInfo={this.showServerInfo} />
            </Col>

            <Col md="8" className="pt-3">
              <h5>Some possible reasons...</h5>

              <ul style={{ color: 'darkgreen' }}>
                <li>
                  <strong>
                    Only a Tablo{' '}
                    <a
                      href="https://www.tablotv.com/tablo-dvrs-how-they-work/"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'blue',
                        textDecoration: 'underline',
                      }}
                    >
                      network connected device
                    </a>
                  </strong>{' '}
                  are compatible.
                  <br />
                  These network connected devices should work with TabloTools:
                  <ul>
                    <li>
                      <a
                        href="https://www.tablotv.com/products/tablo-dual-lite-ota-dvr/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue' }}
                      >
                        Tablo DUAL LITE OTA DVR
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.tablotv.com/products/tablo-dual-128gb-ota-dvr/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue' }}
                      >
                        Tablo DUAL 128GB OTA DVR
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.tablotv.com/products/tablo-quad-ota-dvr/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue' }}
                      >
                        Tablo QUAD OTA DVR
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.tablotv.com/products/tablo-quad-1tb-ota-dvr/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue' }}
                      >
                        Tablo QUAD 1TB OTA DVR
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>
                    Unfortuntaley, Tablo{' '}
                    <a
                      href="https://www.tablotv.com/tablo-tv-connected-dvrs-how-they-work/"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'blue',
                        textDecoration: 'underline',
                      }}
                    >
                      TV connected devices
                    </a>
                  </strong>{' '}
                  can not be accessed using TabloTools. That includes:
                  <ul>
                    <li>
                      <a
                        href="https://www.tablotv.com/products/tablo-dual-hdmi-ota-dvr/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue' }}
                      >
                        Tablo DUAL HDMI OTA DVR
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.tablotv.com/products/tablo-quad-hdmi-ota-dvr/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'blue' }}
                      >
                        Tablo QUAD HDMI OTA DVR
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>No network connection</strong> - somehow this program
                  can not currently access any local network or the internet.
                </li>
              </ul>
              <i>
                * Devices, links, etc. mentioned were current as of September
                1st, 2022
              </i>
            </Col>
          </Row>
        </Container>
      );
    }

    return (
      <div className="pr-2" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
        <Row>
          <Col md="12">
            <Row>
              <Col md="2">
                <LogoBox />
              </Col>
              <Col md="10">
                <Alert variant="primary">
                  <h4 className="">Welcome to Tablo Tools v{appVersion}</h4>
                </Alert>
              </Col>
            </Row>
          </Col>
        </Row>

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
                <div style={{ position: 'relative' }}>
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
      </div>
    );
  }
}
