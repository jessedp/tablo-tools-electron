import React, { Component } from 'react';
import { ipcRenderer, shell } from 'electron';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import axios from 'axios';

import compareVersions from 'compare-versions';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';

type Props = Record<string, unknown>;
type State = {
  show: boolean;
  updateAvailable: boolean;
  record?: Record<string, any>;
};

class VersionStatus extends Component<Props, State> {
  // props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
      updateAvailable: false,
    };
  }

  async componentDidMount() {
    // electron-updater in main proc for full releases
    ipcRenderer.send('update-request');

    if (process.env.NODE_ENV === 'production') {
      setInterval(this.checkUpdate, 1000 * 60 * 60);
      setTimeout(this.checkUpdate, 1000);
    }

    this.checkUpdate();
    ipcRenderer.on('update-reply', () => {
      this.checkUpdate();
    });
  }

  show = () => {
    this.setState({
      show: true,
    });
  };

  close = () => {
    this.setState({
      show: false,
    });
  };

  async checkUpdate() {
    const appVersion = ipcRenderer.sendSync('get-version');
    let data: Array<Record<string, any>>;

    try {
      const resp = await axios.get(
        'https://api.github.com/repos/jessedp/tablo-tools-electron/releases'
      );
      data = resp.data;
    } catch (e) {
      console.warn('Problem loading releases from GH:', e);
      return;
    }

    let notify: Record<string, any> = {};
    data.forEach((rec: Record<string, any>) => {
      if (compareVersions.compare(appVersion, rec.tag_name, '<')) {
        if (rec.prerelease && getConfig().notifyBeta) {
          if (Object.keys(notify).length === 0) notify = rec;
        }

        if (!rec.prerelease && Object.keys(notify).length === 0) notify = rec;
      }
    });

    if (notify && this) {
      this.setState({
        updateAvailable: true,
        record: notify,
      });
    }
  }

  render() {
    const { show, record, updateAvailable } = this.state;

    if (!record || Object.keys(record).length === 0 || !updateAvailable)
      return <></>; //

    let color = 'text-warning ';
    let type = 'NEW Release ';
    let isRelease = true;

    if (record.tag_name.match(/[-]/)) {
      type = 'Pre-release ';
      color = 'text-secondary';
      isRelease = false;
    }

    if (!isRelease && !getConfig().notifyBeta) return <></>; //

    const releaseDate = format(
      Date.parse(record.published_at),
      'ccc M/d/yy @ h:m:s a'
    );
    const title = `${record.tag_name} available as of ${releaseDate}`;
    return (
      <>
        <div className="pt-1">
          <Button
            as="div"
            className=""
            variant="outline-light"
            onClick={this.show}
            onKeyDown={this.show}
            role="button"
            title={title}
            size={'xs' as any}
          >
            <span
              className={color}
              style={{
                fontSize: '14px',
              }}
            >
              <span className="fa fa-exclamation-circle" />
            </span>
          </Button>
        </div>

        <Modal show={show} onHide={this.close} size="lg" scrollable>
          <Modal.Header closeButton>
            <Modal.Title>
              {type} <b>{record.tag_name}</b> was released{' '}
              <RelativeDate date={record.published_at} />.
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div />
            {isRelease ? (
              ''
            ) : (
              <div className="text-danger">
                This is a pre-release. It may be broken. It may be to test a
                fix. It may not do anything interesting. You&apos;ve been
                warned.
              </div>
            )}

            <Button
              className="pt-2 ml-2 mt-3 bolder mb-2"
              variant="success"
              onClick={() => shell.openExternal(record.html_url)}
            >
              <span className="fa fa-download pr-2" />
              Download {record.tag_name} now!
            </Button>

            <br />
            <h4>Release Notes:</h4>
            <ReactMarkdown
              source={record.body}
              disallowedTypes={['link', 'linkReference']}
            />
            <Button
              className="pt-2 ml-2 mt-3 bolder"
              variant="success"
              onClick={() => shell.openExternal(record.html_url)}
            >
              <span className="fa fa-download pr-2" />
              Download {record.tag_name} now!
            </Button>
            <div className="pt-2 smaller">
              Once that&apos;s complete, install it and you&apos;re ready to go!
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.close}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </> //
    );
  }
}

export default VersionStatus;
