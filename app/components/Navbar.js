// @flow
import { ipcRenderer, shell } from 'electron';
import React, { Component, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Modal from 'react-bootstrap/Modal';
import { format } from 'date-fns';
import axios from 'axios';

import { Dropdown, DropdownButton } from 'react-bootstrap';
import routes from '../constants/routes.json';

import PingStatus from './PingStatus';
import DbStatus from './DbStatus';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';
import SelectedBox from './SelectedBox';
import LogoBox from './Logo';
import ScreenControls from './ScreenControls';

const { remote } = require('electron');

const { app } = remote;

type File = {
  url: string,
  sha512: string,
  size: number,
  blockMapSize: number
};

type UpdateMessage = {
  available: boolean,
  info: {
    version: string,
    files: Array<File>,
    path: string,
    sha512: string,
    releaseDate: string,
    releaseName: string,
    releaseNotes: string
  }
};

type Props = { location: Object };
type State = {
  updateAvailable: boolean,
  updateData?: UpdateMessage,
  showToggle: boolean
};

class Navbar extends Component<Props, State> {
  props: Props;

  lastMousePos: { x: number, y: number };

  constructor() {
    super();
    this.state = {
      updateAvailable: false,
      showToggle: false
    };

    (this: any).mouseMove = this.mouseMove.bind(this);
    (this: any).mouseInRange = this.mouseInRange.bind(this);
    (this: any).mouseOutOfRange = this.mouseOutOfRange.bind(this);
  }

  async componentDidMount(): * {
    const checkUpdate = async () => {
      // electron-updater in main proc for full releases
      ipcRenderer.send('update-request');

      // pre-release check
      if (getConfig().notifyBeta) {
        let msg: UpdateMessage = {};
        try {
          const resp = await axios.get(
            'https://api.github.com/repos/jessedp/tablo-tools-electron/releases'
          );
          const data = resp.data[0];
          if (data.prerelease && `v.${app.getVersion()}` !== data.tag_name) {
            msg = releaseToUpdateMsg(data);
          }
        } catch (e) {
          console.warn('Problem loading releases from GH:', e);
        }
        if (msg) this.processUpdate(msg);
      }
    };

    if (process.env.NODE_ENV === 'production') {
      setInterval(checkUpdate, 1000 * 60 * 60);
      setTimeout(checkUpdate, 1000);
    }

    ipcRenderer.on('update-reply', (event, msg) => {
      this.processUpdate(msg);
    });
  }

  mouseMove = (e: any) => {
    this.lastMousePos = { x: e.screenX, y: e.screenY };
    if (this.checkYInbounds(30)) {
      this.setState({ showToggle: true });
    } else {
      this.setState({ showToggle: false });
    }
  };

  checkYInbounds = (limit = 10) => {
    const win = remote.getCurrentWindow();
    const bounds = win.getContentBounds();
    return this.lastMousePos.y - bounds.y + 5 < limit;
  };

  mouseInRange = () => {
    // console.log('mouseInRange', this.lastMousePos);
    this.setState({ showToggle: true });
  };

  mouseOutOfRange = () => {
    // console.log('mouseOutOfRange', this.lastMousePos);

    if (!this.checkYInbounds(30)) {
      this.setState({ showToggle: false });
    }
  };

  async processUpdate(msg: Object) {
    console.log('updateMsg:', msg);
    if (msg.error) {
      console.error('Problem updating: ', msg.error);
      this.setState({
        updateAvailable: false
      });
    }

    if (msg.available === true) {
      await this.setState({ updateAvailable: true, updateData: msg });
    }
  }

  render() {
    const { updateAvailable, showToggle } = this.state;

    let { updateData } = this.state;

    if (updateData) updateData = updateData.info;

    // dropdown state
    let ddText = 'Browse Recordings';
    let ddClass = 'outline-primary';
    // let toggleClass = 'outline-primary';
    const { location } = this.props;
    if (location.pathname === routes.SHOWS) {
      ddText = 'Shows & Series';
      ddClass = 'primary';
    }

    if (location.pathname === routes.MOVIES) {
      ddText = 'Movies';
      ddClass = 'primary';
    }

    if (location.pathname === routes.SPORTS) {
      ddText = 'Sports & Events';
      ddClass = 'primary';
    }

    if (location.pathname === routes.PROGRAMS) {
      ddText = 'Manual';
      ddClass = 'primary';
    }
    // if (ddClass) toggleClass = `${toggleClass} active`;
    return (
      <Row
        className="mb-2 top-bar"
        onMouseOver={this.mouseInRange}
        onMouseOut={this.mouseOutOfRange}
        onFocus={this.mouseInRange}
        onBlur={this.mouseOutOfRange}
        onMouseMove={this.mouseMove}
      >
        <ScreenControls mouseInRange={showToggle} />
        <Col md="7">
          <LogoBox />
          <div className="menu-buttons">
            <ButtonGroup className="ml-2 pt-1">
              <LinkContainer activeClassName="active" to={routes.HOME}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  as="button"
                  title="Home"
                >
                  <span className="fa fa-home" />
                </Button>
              </LinkContainer>
              <LinkContainer activeClassName="active" to={routes.LIVETV}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  as="button"
                  title="Watch Live"
                >
                  <span className="fa fa-tv" />
                </Button>
              </LinkContainer>

              <LinkContainer activeClassName="active" to={routes.OVERVIEW}>
                <Button
                  as="button"
                  size="sm"
                  variant="outline-primary"
                  className="align-middle"
                >
                  <span>Overview</span>
                </Button>
              </LinkContainer>

              <DropdownButton
                as={ButtonGroup}
                style={{ width: '160px' }}
                title={ddText}
                variant={ddClass}
              >
                <LinkContainer activeClassName="active" to={routes.SHOWS}>
                  <Dropdown.Item>
                    <span className="fa fa-tv pr-2 menu-icon" />
                    Shows & Series
                  </Dropdown.Item>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.MOVIES}>
                  <Dropdown.Item>
                    <span className="fa fa-film pr-2 menu-icon" />
                    Movies
                  </Dropdown.Item>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.SPORTS}>
                  <Dropdown.Item>
                    <span className="fa fa-quidditch pr-2 menu-icon" />
                    Sports & Events
                  </Dropdown.Item>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.PROGRAMS}>
                  <Dropdown.Item>
                    <span className="fa fa-keyboard pr-2 menu-icon" />
                    Manual
                  </Dropdown.Item>
                </LinkContainer>
              </DropdownButton>

              <LinkContainer activeClassName="active" to={routes.SEARCH}>
                <Button size="sm" variant="outline-primary" as="button">
                  Search
                </Button>
              </LinkContainer>
            </ButtonGroup>
          </div>
        </Col>
        <Col md="5">
          <Row>
            <Col md="2">
              <SelectedBox />
            </Col>
            <Col md="10" className="smaller pt-1  align-items menu-buttons">
              <div className="d-flex flex-row-reverse">
                <div>
                  <VersionStatus
                    updateData={updateData}
                    available={updateAvailable}
                  />
                </div>
                <div className="pr-1">
                  <LinkContainer activeClassName="active" to={routes.SETTINGS}>
                    <Button size="sm" variant="outline-dark" title="Settings">
                      <i className="fa fa-cogs" />
                    </Button>
                  </LinkContainer>
                </div>
                <div className="pt-2 p-0 pr-0">
                  <DbStatus />
                </div>
                <div className="pt-2 pr-0 mr-4">
                  <PingStatus />
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

function VersionStatus(prop) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { updateData, available } = prop;

  if (!updateData || !available) return <></>;

  let color = 'text-warning ';
  let type = 'NEW Release ';
  let isRelease = true;
  if (updateData.version.match(/[a-zA-Z]/)) {
    type = 'Pre-release ';
    color = 'text-secondary';
    isRelease = false;
  }

  if (!isRelease && !getConfig().notifyBeta) return <></>;

  const releaseDate = format(
    Date.parse(updateData.releaseDate),
    'ccc M/d/yy @ h:m:s a'
  );
  const title = `${updateData.version} available as of ${releaseDate}`;
  let downloadUrl = `https://github.com/jessedp/tablo-tools-electron/releases/download/${updateData.version}/${updateData.path}`;
  if (!updateData.path)
    downloadUrl = `https://github.com/jessedp/tablo-tools-electron/releases/tag/${updateData.version}/${updateData.path}`;

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
            {type} <b>{updateData.version}</b> was released{' '}
            <RelativeDate date={updateData.releaseDate} />.
          </div>
          {isRelease ? (
            ''
          ) : (
            <div className="text-danger">
              This is a pre-release. It may be broken. It may be to test a fix.
              It may not do anything interesting. You&apos;ve been warned.
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
            className="pt-2 mt-3"
            variant="outline-secondary"
            onClick={() => shell.openExternal(downloadUrl)}
          >
            Download {updateData.version} now!
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
    </> //
  );
}

function releaseToUpdateMsg(data): UpdateMessage {
  return {
    available: true,
    info: {
      version: data.tag_name,
      files: [],
      path: '',
      sha512: '',
      releaseDate: data.published_at,
      releaseName: data.name,
      releaseNotes: data.body
    }
  };
}

/**
 updateData = {
    available: true,
    info: {
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


 const updateData = {
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

export default withRouter(Navbar);
