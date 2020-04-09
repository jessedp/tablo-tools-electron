// @flow
import React, { Component, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

import clockStyles from './Clock.css';
import TitleSlim from './TitleSlim';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import {
  readableDuration,
  secondsToTimeStr,
  timeStrToSeconds
} from '../utils/utils';

type Props = {
  airing: Airing
};

type State = {
  exportInc: number,
  exportState: number,
  exportLabel: string,
  ffmpegLog: [],
  startTime: number,
  curTime: number
};

const EXP_WAITING = 1;
const EXP_WORKING = 2;
const EXP_DONE = 3;
const EXP_CANCEL = 4;

const beginTime = '00:00 / 00:00';

export default class RecordingExport extends Component<Props, State> {
  props: Props;

  timer: IntervalID;

  shouldCancel: boolean;

  constructor() {
    super();
    this.state = {
      exportInc: 0,
      exportState: EXP_WAITING,
      exportLabel: beginTime,
      ffmpegLog: [],
      startTime: 0,
      curTime: 0
    };
    this.shouldCancel = false;

    (this: any).updateProgress = this.updateProgress.bind(this);
  }

  componentWillUnmount() {
    const { airing } = this.props;
    airing.cancelVideoProcess();
  }

  startTimer() {
    this.setState({
      startTime: Date.now(),
      curTime: Date.now()
    });
    this.timer = setInterval(() => {
      const { startTime } = this.state;
      this.setState({
        curTime: Date.now() - startTime
      });
    }, 1);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  async processVideo() {
    const { exportState } = this.state;
    if (exportState === EXP_DONE) return;
    const { airing } = this.props;

    this.setState({
      exportState: EXP_WORKING,
      exportInc: 0,
      exportLabel: beginTime
    });

    // console.log('starting', airing.object_id, new Date());

    this.startTimer();

    const ffmpegLog = await airing.processVideo(this.updateProgress);

    this.stopTimer();

    if (this.shouldCancel === true) {
      await this.setState({
        exportState: EXP_CANCEL,
        ffmpegLog
      });
    } else {
      await this.setState({
        exportState: EXP_DONE,
        exportInc: 0,
        exportLabel: beginTime,
        ffmpegLog
      });
    }
  }

  async cancelProcess() {
    const { exportState } = this.state;

    if (exportState !== EXP_WORKING) return;

    this.shouldCancel = true;

    const { airing } = this.props;

    await airing.cancelVideoProcess();
    this.setState({
      exportInc: 0,
      exportState: EXP_CANCEL,
      exportLabel: beginTime
    });
  }

  updateProgress = (progress: Object) => {
    const { exportState } = this.state;
    if (exportState === EXP_DONE) return;

    const { airing } = this.props;

    // console.log(progress);
    if (progress.finished) {
      this.setState({
        exportInc: 1000,
        exportState: EXP_DONE,
        exportLabel: 'Complete'
      });
    } else {
      // const pct = progress.percent  doesn't always work, so..
      const pct = Math.round(
        (timeStrToSeconds(progress.timemark) /
          parseInt(airing.videoDetails.duration, 10)) *
          100
      );

      const label = `${progress.timemark} / ${readableDuration(
        airing.videoDetails.duration
      )}`;

      // console.log(airing.object_id, 'pct', pct);
      // console.log(airing.object_id, 'timemark', progress.timemark);
      // console.log(airing.object_id, 'label', label);

      this.setState({
        exportInc: pct,
        exportState: EXP_WORKING,
        exportLabel: label
      });
    }
  };

  render() {
    const { airing } = this.props;
    const {
      exportInc,
      exportLabel,
      exportState,
      curTime,
      ffmpegLog
    } = this.state;

    const classes = `border pb-1 mb-2 pt-1`;

    // console.log('render', airing.object_id, ffmpegLog);

    return (
      <Container className={classes}>
        <Row>
          <Col md="1">
            <TabloImage imageId={airing.background} maxHeight={50} />
          </Col>
          <Col md="6">
            <TitleSlim airing={airing} withShow={1} />
          </Col>
          <Col md="5">
            <ExportProgress
              label={exportLabel}
              state={exportState}
              inc={exportInc}
              ffmpegLog={ffmpegLog}
              time={curTime}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

type EPProp = {
  inc: number,
  state: number,
  label: string,
  time: number,
  ffmpegLog: []
};

function ExportProgress(prop: EPProp) {
  const { inc, label, state, time, ffmpegLog } = prop;

  const timeStr = secondsToTimeStr(time / 1000, ':');

  if (state === EXP_WAITING) {
    return (
      <Alert variant="light" className="m-0 muted smaller">
        <span className="fa fa-pause-circle" /> waiting...
      </Alert>
    );
  }

  if (state === EXP_DONE) {
    return (
      <Alert variant="success" className="m-0 muted">
        <Row>
          <Col md="12">
            <span className="fa fa-check-circle pr-2" />
            <span className="pr-5">Finished in {timeStr}</span>
            <FfmpegLog log={ffmpegLog} />
          </Col>
        </Row>
      </Alert>
    );
  }

  if (state === EXP_CANCEL) {
    return (
      <Alert variant="warning" className="m-0 muted">
        <Row>
          <Col md="12">
            <span className="fa fa-check-circle pr-2" />
            <span className="pr-5">Canceled after {timeStr}</span>
            <FfmpegLog log={ffmpegLog} />
          </Col>
        </Row>
      </Alert>
    );
  }

  // if (exportState === EXP_WORKING)
  const pctLbl = `${Math.round(inc)} %`;
  return (
    <div className="d-flex flex-row">
      <div style={{ width: '100%' }}>
        <ProgressBar
          animated
          max="100"
          now={inc}
          label={pctLbl}
          className="m-0"
        />
        <span className="d-flex justify-content-center smaller muted">
          {label}
        </span>
      </div>
      <div>
        <Timer timeStr={timeStr} />
      </div>
    </div>
  );
}

function Timer(prop) {
  const { timeStr } = prop;

  const parts = timeStr.split(':');
  // console.log(parts);

  return (
    <div className={clockStyles.clock}>
      <span>{parts[0]}</span>
      <span>{parts[1]}</span>
      <span>{parts[2]}</span>
    </div>
  );
}

function FfmpegLog(prop) {
  const { log } = prop;
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  if (log.length === 0) return <i>No log</i>;
  // const logs = Object.keys(log).map(id => log[id]);
  // {logs}
  let i = 0;
  if (isOpen) {
    return (
      <>
        <Button variant="outline-dark" size="xs" onClick={toggle}>
          <span className="fa fa-arrow-left" /> log
        </Button>

        <div className="border">
          <div className="badge-light">
            {log.map(row => {
              i += 1;
              return <div key={`logrow-${i}`}>{row}</div>;
            })}
          </div>
        </div>
      </>
    );
  }
  return (
    <Button variant="secondary" size="xs" onClick={toggle}>
      <span className="fa fa-arrow-right" /> log
    </Button>
  );
}
