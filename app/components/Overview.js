// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import DbStats from './DbStats';

import ComskipDetails from './ComskipDetails';
import TimeOfDayStats from './TimeOfDayStats';
import ResolutionChannelStats from './ResolutionChannelStats';
import { parseSeconds, readableBytes } from '../utils/utils';
import ChannelShowStats from './ChannelShowStats';
import ShowStats from './ShowStats';
import Duration from './Duration';
import { comskipAvailable } from '../utils/Tablo';
import ResolutionSizeStats from './ResolutionSizeStats';
import RecordingDurationStats from './RecordingDurationStats';

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

  topRef: any;

  showsStatsRef: any;

  timeStatsRef: any;

  constructor() {
    super();
    const currentDevice = store.get('CurrentDevice');
    this.state = { currentDevice, duration: [], size: 0 };

    this.topRef = React.createRef();
    this.showsStatsRef = React.createRef();
    this.timeStatsRef = React.createRef();

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

    return (
      <div className="section">
        <Row className="stats-header justify-content-md-center">
          <Col md="4" className="text-center" align="center">
            Recording Time: &nbsp;
            <Duration duration={duration} />
          </Col>
          <Col md="4" className="text-center" align="center">
            <ButtonGroup className="ml-2">
              <Button
                size="xs"
                variant="outline-secondary"
                onClick={() => this.topRef.current.scrollIntoView()}
              >
                <span className="fa fa-home" />
              </Button>

              <Button
                size="xs"
                variant="outline-secondary"
                onClick={() =>
                  this.showsStatsRef.current.scrollIntoView({
                    block: 'start'
                  })
                }
              >
                Show Stats
              </Button>
              <Button
                size="xs"
                variant="outline-secondary"
                onClick={() =>
                  this.timeStatsRef.current.scrollIntoView({
                    block: 'start'
                  })
                }
              >
                Time Stats
              </Button>
            </ButtonGroup>
          </Col>
          <Col md="4" align="center">
            Recording Size: &nbsp;
            {readableBytes(size)}
          </Col>
        </Row>

        <div className="scrollable-area">
          <Row>
            <Col md="auto" ref={this.topRef}>
              <Alert variant="primary" className="p-2 m-0">
                Recordings
              </Alert>
              <DbStats />
            </Col>

            <Col md="auto" className="stat-small">
              <Col>
                <Alert variant="primary" className="p-2 m-0">
                  Resolution/Channel Stats
                </Alert>
                <ResolutionChannelStats />
              </Col>

              <Col>
                <Alert variant="primary" className="p-2 m-0">
                  Channel/Show Stats
                </Alert>
                <ChannelShowStats />
              </Col>
            </Col>
            <Col md="auto" className="stat-small">
              <Alert variant="primary" className="p-2 m-0">
                Resolution/Size Stats
              </Alert>
              <ResolutionSizeStats />
              <Alert variant="primary" className="p-2 m-0 mt-4">
                Duration Stats
              </Alert>
              <RecordingDurationStats />
            </Col>

            <Col
              md="auto"
              style={{ minWidth: '600px' }}
              ref={this.timeStatsRef}
            >
              <Alert variant="primary" className="p-2 m-0">
                Time of Day Stats
              </Alert>
              <TimeOfDayStats />
            </Col>

            {comskipAvailable() ? (
              <Col md="auto" className="stat-small">
                <Alert variant="primary" className="p-2 m-0">
                  Commercial Skip Stats
                </Alert>
                <ComskipDetails />
              </Col>
            ) : (
              ''
            )}

            <Col
              md="auto"
              style={{ minWidth: '600px' }}
              ref={this.showsStatsRef}
            >
              <Alert variant="primary" className="p-2 m-0">
                Show Stats
              </Alert>
              <ShowStats />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
