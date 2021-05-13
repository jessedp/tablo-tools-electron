import React, { Component } from 'react';
import axios from 'axios';
import Store from 'electron-store';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import ReactMarkdown from 'react-markdown';
import compareVersions from 'compare-versions';
import Button from './ButtonExtended';
import { version } from '../../package.json';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';

const { app } = require('electron').remote;

if (process.env.NODE_ENV !== 'production') {
  app.getVersion = () => version;
}

type Props = Record<string, never>;
type State = {
  show: boolean;
  releases: Array<Record<string, any>>;
};
export default class VersionInfo extends Component<Props, State> {
  // props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
      releases: [],
    };
    (this as any).handleClose = this.handleClose.bind(this);
  }

  async componentDidMount() {
    const store = new Store();
    let lastVersion = store.get('LastVersion');
    if (!lastVersion) lastVersion = '0.0.0';
    const match = lastVersion.match(/[\d.]*/);
    const relLastVersion = match ? match[0] : '0.0.0';
    const relNewVersion = app.getVersion().match(/[\d.]*/)[0];
    const beta = !!app.getVersion().match(/[a-zA-Z]/);

    if (
      (beta && lastVersion !== app.getVersion()) ||
      compareVersions.compare(relLastVersion, relNewVersion, '<')
    ) {
      let releases;

      try {
        releases = await axios.get(
          'https://api.github.com/repos/jessedp/tablo-tools-electron/releases'
        );
        this.setState({
          show: true,
          releases: releases.data,
        });
      } catch (e) {
        console.error('Problem loading releases from GH:', e);
      }
    }
  }

  handleClose() {
    const store = new Store();
    store.set('LastVersion', app.getVersion());
    this.setState({
      show: false,
    });
  }

  render() {
    const { show, releases } = this.state;
    if (!releases) return <></>; //

    return (
      <Modal
        size="lg"
        show={show}
        onHide={this.handleClose}
        animation={false}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Welcome to Tablo Tools &nbsp;
            <span className="text-danger">v{app.getVersion()}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="text-warning">Here&apos;s what&apos;s new!</h5>
          {releases.map((release) => (
            <Release data={release} key={release.id} />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <span className="smaller muted">
            <i>Note: this will only show once per version</i>
          </span>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

function Release(prop: any) {
  const { data } = prop;
  const config = getConfig();
  let notifyBeta = false;

  if (Object.prototype.hasOwnProperty.call(config, 'notifyBeta')) {
    notifyBeta = config.notifyBeta;
  }

  const beta = !!app.getVersion().match(/[a-zA-Z]/);
  if (!beta && !notifyBeta && data.prerelease) return <></>; //

  const bg = 'light';
  // const text = 'dark';
  let border = '';

  if (notifyBeta && data.prerelease) {
    // bg = 'secondary';
    // text = 'text-dark';
    border = 'danger';
  }

  return (
    <Card border={border} bg={bg} className="mb-2">
      <Card.Header>
        {data.name}{' '}
        <span className="pl-2 smaller muted">
          <RelativeDate date={data.published_at} />{' '}
        </span>
      </Card.Header>
      <Card.Body className="pt-2 pb-1">
        <ReactMarkdown source={data.body} />
      </Card.Body>
    </Card>
  );
}
