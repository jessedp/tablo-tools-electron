// @flow
/** This is poorly named - the SideBar is actually the TopBar * */

import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import routes from '../constants/routes.json';
import Api, { checkConnection } from '../utils/Tablo';
import tabloLogo from '../../resources/tablo_logo.png';

type Props = {};
type State = { current: string, pingInd: boolean };

export default class Sidebar extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { current: routes.HOME, pingInd: false };
    (this: any).setHome = this.setHome.bind(this);
    (this: any).setOvw = this.setOvw.bind(this);
    (this: any).setBrowse = this.setBrowse.bind(this);
    (this: any).setSettings = this.setSettings.bind(this);
  }

  async componentDidMount() {
    const checkConn = async () => {
      const test = await checkConnection();
      //  console.log('conn: ', test);
      this.setState({ pingInd: test });
    };
    await checkConn();
    setInterval(await checkConn, 10000);
  }

  async setView(view: string) {
    await this.setState({ current: view });
  }

  async setHome() {
    await this.setState({ current: routes.HOME });
  }

  async setOvw() {
    await this.setState({ current: routes.OVERVIEW });
  }

  async setBrowse() {
    await this.setState({ current: routes.BROWSE });
  }

  async setSettings() {
    await this.setState({ current: routes.SETTINGS });
  }

  render() {
    const { current, pingInd } = this.state;

    const baseClass = '';
    let homeBtnClass = baseClass;
    let ovwBtnClass = baseClass;
    let browseBtnClass = baseClass;
    let settingsBtnClass = baseClass;

    switch (current) {
      case routes.HOME:
        homeBtnClass = 'active';
        break;
      case routes.OVERVIEW:
        ovwBtnClass = 'active';
        break;
      case routes.SETTINGS:
        settingsBtnClass = 'active';
        break;
      case routes.BROWSE:
      default:
        browseBtnClass = 'active';
    }

    let pingStatus = 'text-danger';
    if (pingInd) {
      pingStatus = 'text-success';
    }

    return (
      <Row className="mb-2">
        <Col md="auto">
          <Image src={tabloLogo} style={{ width: '125px', padding: '5px' }} />
        </Col>
        <Col>
          <ButtonGroup className="ml-5" style={{ minWidth: '250px' }}>
            <LinkContainer
              activeClassName=""
              onClick={this.setHome}
              to={routes.HOME}
            >
              <Button className={`${homeBtnClass}`} size="sm" variant="primary">
                Home
              </Button>
            </LinkContainer>
            <LinkContainer
              activeClassName=""
              onClick={this.setOvw}
              to={routes.OVERVIEW}
            >
              <Button className={`${ovwBtnClass}`} size="sm" variant="primary">
                Overview
              </Button>
            </LinkContainer>
            <LinkContainer
              activeClassName=""
              onClick={this.setBrowse}
              to={routes.BROWSE}
            >
              <Button
                className={`${browseBtnClass}`}
                size="sm"
                variant="primary"
              >
                Browse
              </Button>
            </LinkContainer>
          </ButtonGroup>
        </Col>
        <Col md="auto" className="float-right mt-1">
          <StatusBar pingStatus={pingStatus} />
        </Col>
        <Col md="auto" className="float-right">
          <LinkContainer
            activeClassName=""
            onClick={this.setSettings}
            to={routes.SETTINGS}
          >
            <Button
              className={`${settingsBtnClass}`}
              size="sm"
              variant="outline-dark"
              title="Settings"
            >
              <i className="fa fa-cogs" />
            </Button>
          </LinkContainer>
        </Col>
      </Row>
    );
  }
}

function StatusBar(prop) {
  const { pingStatus } = prop;

  let ip = '';
  if (Api.device) {
    ip = Api.device.private_ip;
  }
  return (
    <>
      <span className="d-inline text-muted smaller pr-2"> {ip}</span>
      <i className={`d-inline fa fa-circle ${pingStatus}`} />
    </>
  );
}
