// @flow
/** This is poorly named - the SideBar is actually the TopBar * */
import { ipcRenderer, shell } from 'electron';
import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Modal from 'react-bootstrap/Modal';
import { format } from 'date-fns';
import routes from '../constants/routes.json';
import tabloLogo from '../../resources/tablo_tools_logo.png';
import PingStatus from './PingStatus';
import DbStatus from './DbStatus';
import RelativeDate from './RelativeDate';

type Props = {};
type State = { current: string, updateData: UpdateMessage };

type UpdateMessage = {
  available: boolean,
  info: any,
  error: string | null
};

export default class Sidebar extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      current: routes.HOME,
      updateData: { available: false, error: '', info: null }
    };
    (this: any).setHome = this.setHome.bind(this);
    (this: any).setOvw = this.setOvw.bind(this);
    (this: any).setBrowse = this.setBrowse.bind(this);
    (this: any).setSettings = this.setSettings.bind(this);
  }

  async componentDidMount(): * {
    const checkUpdate = () => ipcRenderer.send('update-request');
    setInterval(checkUpdate, 60000);
    setTimeout(checkUpdate, 1000);

    ipcRenderer.on('update-reply', (event, msg) => {
      this.processUpdate(msg);
    });
  }

  async processUpdate(msg: UpdateMessage) {
    console.log('processUpdate', msg);

    console.log(msg);
    if (msg.error) {
      console.error('Problem updating: ', msg.error);
      this.setState({
        updateData: { available: false, error: msg.error, info: null }
      });
    }

    if (msg.available === true) {
      await this.setState({ updateData: msg });
    }
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
    const { current, updateData } = this.state;
    console.log(updateData);
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

    return (
      <Row className="mb-2">
        <Col md="1">
          <Image src={tabloLogo} style={{ width: '125px', padding: '5px' }} />
        </Col>
        <Col className="ml-2 mt-2">
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
        <Col md="auto" className="float-right mt-2 smaller pt-1" />
        <Col md="auto" className="float-right mt-2 smaller pt-1">
          <DbStatus />
        </Col>
        <Col md="auto" className="float-right mt-2">
          <PingStatus />
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
        <VersionStatus updateData={updateData} />
      </Row>
    );
  }
}

function VersionStatus(prop) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let { updateData } = prop;

  updateData = {
    available: true,
    info: {
      version: '0.1.5-alpha.1',
      files: [
        {
          url: 'TabloTools-0.1.5-alpha.1.AppImage',
          sha512:
            'UXe1WqXe+xxc+jVc1bWAFvd3w1w8jNej/Dg0PkyhieyRZOcKYne0GmoiKnv2Nio0H0JcHW4bb99RtPzkRh3zZw==',
          size: 126827108,
          blockMapSize: 133752
        }
      ]
    },
    path: 'TabloTools-0.1.5-alpha.1.AppImage',
    sha512:
      'UXe1WqXe+xxc+jVc1bWAFvd3w1w8jNej/Dg0PkyhieyRZOcKYne0GmoiKnv2Nio0H0JcHW4bb99RtPzkRh3zZw==',
    releaseDate: '2020-04-13T14:56:04.632Z',
    releaseName: '0.1.5-alpha.1',
    releaseNotes:
      '<p>Fix one for loading Airings where the data is physically missing.</p>'
  };

  const { info } = updateData;

  if (!updateData || !updateData.available) return <></>;
  console.log('updateData.releaseDate', updateData.releaseDate);

  let color = 'text-warning ';
  let type = 'NEW Release ';
  let isRelease = true;
  if (info.version.match(/[a-zA-Z]/)) {
    type = 'Pre-release ';
    color = 'text-secondary';
    isRelease = false;
  }

  const releaseDate = format(
    Date.parse(updateData.releaseDate),
    'ccc M/d/yy @ h:m:s a'
  );
  const title = `v${info.version} available as of ${releaseDate}`;
  const downloadUrl = `https://github.com/jessedp/tablo-tools-electron/releases/download/v${info.version}/${updateData.path}`;

  return (
    <>
      <div className="pt-1">
        <Button
          as="div"
          className=""
          variant="outline-light"
          onClick={handleShow}
          onKeyDown={handleShow}
          role="button"
          title={title}
          size="xs"
        >
          <span className={color} style={{ fontSize: '14px' }}>
            <span className="fa fa-exclamation-circle" />
          </span>
        </Button>
      </div>

      <Modal show={show} onHide={handleClose} scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Update Available!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {type} v{info.version} was released{' '}
            <RelativeDate date={updateData.releaseDate} />.
          </div>
          {isRelease ? (
            ''
          ) : (
            <div className="text-danger">
              This is a pre-release. It may be broken. It may be to test a fix.
              It may not do anyting interesting. You&apos;ve been warned.
            </div>
          )}
          <br />
          <h6>Notes:</h6>
          <code>
            {/* eslint-disable-next-line react/no-danger */}
            <div
              dangerouslySetInnerHTML={{ __html: updateData.releaseNotes }}
            />
          </code>
          <Button
            className="pt-2"
            variant="outline-secondary"
            onClick={() => shell.openExternal(downloadUrl)}
          >
            Download v{info.version} now!
          </Button>
          <div className="pt-2 smaller">
            Once that&apos;s complete, install it and you&apos;re ready to go!
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/**
 const testData = {
  available: true,
  info: {
    version: '0.1.3',
    files: [
      {
        url: 'TabloTools-0.1.3.AppImage',
        sha512:
          '5/oBJQRDvN9oJxILQgzRfWjFmjLl9BycU1paATtqM4wNI3hpam05KJWjjHM5NIx5C1rmICewWNGf9GIz+I+FMg==',
        size: 129909853,
        blockMapSize: 136305
      }
    ],
    path: 'TabloTools-0.1.3.AppImage',
    sha512:
      '5/oBJQRDvN9oJxILQgzRfWjFmjLl9BycU1paATtqM4wNI3hpam05KJWjjHM5NIx5C1rmICewWNGf9GIz+I+FMg==',
    releaseDate: '2020-04-13T00:33:22.099Z'
  },
  error: null
};
 */
