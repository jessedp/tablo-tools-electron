// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import compareVersions from 'compare-versions';

import Alert from 'react-bootstrap/Alert';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import DbStats from './DbStats';

import ComskipDetails from './ComskipDetails';
import TimeStats from './TimeStats';
import ResolutionStats from './ResolutionStats';
import { parseSeconds, readableBytes } from '../utils/utils';
import ChannelStats from './ChannelStats';

const Store = require('electron-store');

const store = new Store();

type Props = {};
type State = {
  currentDevice: Object,
  duration: Array<number>,
  size: number
};

export default class Overview extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    const currentDevice = store.get('CurrentDevice');
    this.state = { currentDevice, duration: [], size: 0 };

    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  psToken = null;

  async refresh() {
    const { RecDb } = global;

    const recs = await RecDb.asyncFind({});
    const duration = recs.reduce(
      (a, b) => a + (b.video_details.duration || 0),
      0
    );
    const size = recs.reduce((a, b) => a + (b.video_details.size || 0), 0);

    this.setState({ duration: parseSeconds(duration), size });
  }

  render() {
    const { currentDevice, duration, size } = this.state;

    if (!currentDevice)
      return <Alert variant="warning">No device selected</Alert>;

    let comskipAvailable = false;
    if (currentDevice.server_version) {
      const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
      comskipAvailable = compareVersions(testVersion, '2.2.26') >= 0;
    }

    return (
      <div className="section">
        <Row className="p-2 m-2 border bg-light">
          <Col>
            Recording Time: &nbsp;
            {duration[0]} months {duration[1]} days {duration[2]} weeks{' '}
            {duration[3]} minutes
          </Col>
          <Col>
            Recording Size: &nbsp;
            {readableBytes(size)}
          </Col>
        </Row>

        <div className="scrollable-area">
          <Row>
            <Col>
              <Alert variant="primary" className="p-2 m-0">
                Recordings
              </Alert>
              <DbStats />
            </Col>

            <Col>
              <Alert variant="primary" className="p-2 m-0">
                Resolution/Channel Stats
              </Alert>
              <ResolutionStats />
            </Col>

            <Col>
              <Alert variant="primary" className="p-2 m-0">
                Channel/Show Stats
              </Alert>
              <ChannelStats />
            </Col>

            {comskipAvailable ? (
              <Col>
                <Alert variant="primary" className="p-2 m-0">
                  Commercial Skip Stats
                </Alert>
                <ComskipDetails />
              </Col>
            ) : (
              ''
            )}
            <Col>
              <Alert variant="primary" className="p-2 m-0">
                Time Stats
              </Alert>
              <TimeStats />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
