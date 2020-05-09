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
import axios from 'axios';

import routes from '../constants/routes.json';
import tabloLogo from '../../resources/tablo_tools_logo.png';
import PingStatus from './PingStatus';
import DbStatus from './DbStatus';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';

const { app } = require('electron').remote;

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

type Props = {};
type State = {
  updateAvailable: boolean,
  updateData?: UpdateMessage
};

export default class Navbar extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      updateAvailable: false
    };
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
    const { updateAvailable } = this.state;
    let { updateData } = this.state;

    if (updateData) updateData = updateData.info;

    return (
      <Row className="mb-2">
        <Col md="6">
          <Image src={tabloLogo} style={{ width: '125px', padding: '5px' }} />
          <ButtonGroup className="ml-2">
            <LinkContainer activeClassName="active" to={routes.HOME}>
              <Button size="sm" variant="outline-primary">
                <span className="fa fa-home" />
              </Button>
            </LinkContainer>

            <LinkContainer activeClassName="active" to={routes.OVERVIEW}>
              <Button size="sm" variant="outline-primary">
                Overview
              </Button>
            </LinkContainer>

            <LinkContainer activeClassName="active" to={routes.SHOWS}>
              <Button size="sm" variant="outline-primary">
                Shows
              </Button>
            </LinkContainer>

            <LinkContainer activeClassName="active" to={routes.SEARCH}>
              <Button size="sm" variant="outline-primary">
                Search
              </Button>
            </LinkContainer>
          </ButtonGroup>
        </Col>
        <Col md="4" className="offset-md-2 smaller pt-1  align-items">
          <div className="d-flex flex-row-reverse">
            <div>
              <VersionStatus
                updateData={updateData}
                available={updateAvailable}
              />
            </div>
            <div className="pr-2">
              <LinkContainer activeClassName="active" to={routes.SETTINGS}>
                <Button size="sm" variant="outline-dark" title="Settings">
                  <i className="fa fa-cogs" />
                </Button>
              </LinkContainer>
            </div>
            <div className="pr-4 pt-2">
              <PingStatus />
            </div>
            <div className="pr-3 pt-2">
              <DbStatus />
            </div>
          </div>
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
    </>
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
