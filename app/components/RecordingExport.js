// @flow
import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import TitleSlim from './TitleSlim';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import { readableDuration, timeStrToSeconds } from '../utils/utils';

type Props = {
  airing: Airing,
  freeze: boolean
};

type State = {
  exportInc: number,
  exportState: number,
  exportLabel: string,
  ffmpegLog: {}
};

const EXP_WAITING = 1;
const EXP_WORKING = 2;
const EXP_DONE = 3;

const beginTime = '00:00 / 00:00';

export default class RecordingExport extends Component<Props, State> {
  props: Props;

  ffmpegLog: {};

  static defaultProps: { freeze: false };

  constructor(props: Props) {
    super();

    this.state = {
      exportInc: 0,
      exportState: props.freeze ? EXP_DONE : EXP_WAITING,
      exportLabel: beginTime,
      ffmpegLog: {}
    };

    (this: any).updateProgress = this.updateProgress.bind(this);
    (this: any).shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
  }

  shouldComponentUpdate(nextProps: Props) {
    return !nextProps.freeze;
  }

  componentWillUnmount() {
    const { airing } = this.props;
    airing.cancelVideoProcess();
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

    // const ffmpegLog = await airing.processVideo(this.updateProgress);
    await airing.processVideo(this.updateProgress);

    // ffmpeg log -> console.log('retVal', returnVal);
    // console.log('ffmpegLog', ffmpegLog);

    // console.log('done with', airing.object_id, new Date());
    this.setState({
      exportState: EXP_DONE,
      exportInc: 0,
      exportLabel: beginTime
    });

    return this.ffmpegLog;
  }

  async cancelProcess() {
    const { exportState } = this.state;
    if (exportState === EXP_DONE) return;

    const { airing } = this.props;

    if (exportState === EXP_WORKING) {
      await airing.cancelVideoProcess();
    }

    this.setState({
      exportInc: 0,
      exportState: EXP_WAITING,
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
    const { exportInc, exportLabel, exportState, ffmpegLog } = this.state;

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
  label: string
};

function ExportProgress(prop: EPProp) {
  const { inc, label, state } = prop;

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
          <Col md="4">
            <span className="fa fa-check-circle" /> Finished!
          </Col>
        </Row>
      </Alert>
    );
  }

  // if (exportState === EXP_WORKING)
  const pctLbl = `${Math.round(inc)} %`;
  return (
    <>
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
    </>
  );
}

/**
function FfmpegLog(log) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  console.log(log.data);
  // const logs = Object.keys(log).map(id => log[id]);
  // {logs}
  if (isOpen) {
    return (
      <>
        <Button variant="outline-dark" size="xs" onClick={toggle}>
          <span className="fa fa-arrow-up"/>
        </Button>
        <pre>
             {}
        </pre>
      </>
    );
  }
  return (
    <Button variant="outline-dark" size="xs" onClick={toggle}>
      <span className="fa fa-arrow-right"/>
    </Button>
  );
}
*/
