// @flow
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { timeStrToSeconds, readableDuration } from '../utils/utils';
import Title from './Title';
import Airing from '../utils/Airing';

type Props = { airing: Airing };
type State = { opened: boolean, exportInc: number, exportLbl: string };

const beginTime = '0:00/0:00';

/** TODO: exportInc is used as a counter and state
 * and should be split accordingly */

export default class VideoExport extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      opened: false,
      exportInc: -1,
      exportLbl: beginTime
    };

    (this: any).toggle = this.toggle.bind(this);
    (this: any).show = this.show.bind(this);
    (this: any).processVideo = this.processVideo.bind(this);
    (this: any).updateProgress = this.updateProgress.bind(this);
    (this: any).cancelProcess = this.cancelProcess.bind(this);
  }

  componentWillUnmount() {
    const { airing } = this.props;
    airing.cancelVideoProcess();
    this.setState({});
  }

  show() {
    this.setState({
      opened: true
    });
  }

  toggle() {
    const { opened } = this.state;
    this.setState({
      opened: !opened
    });
  }

  async processVideo() {
    const { airing } = this.props;

    this.setState({
      opened: true,
      exportInc: 0,
      exportLbl: beginTime
    });
    await airing.processVideo(this.updateProgress);
  }

  async cancelProcess() {
    const { airing } = this.props;
    const { exportInc } = this.state;
    if (exportInc !== -2) {
      airing.cancelVideoProcess();
    }
    await this.setState({
      exportInc: -1,
      exportLbl: beginTime,
      opened: false
    });
  }

  updateProgress(progress: Object) {
    const { airing } = this.props;

    if (progress.finished) {
      this.setState({
        exportInc: -2,
        exportLbl: 'Complete'
      });
    } else {
      // const pct = progress.percent  doesn't always work, so..
      const pct = Math.round(
        (timeStrToSeconds(progress.timemark) /
          timeStrToSeconds(readableDuration(airing.videoDetails.duration))) *
          100
      );
      const label = `${progress.timemark} / ${readableDuration(
        airing.videoDetails.duration
      )}`;
      this.setState({
        exportInc: pct,
        exportLbl: label
      });
    }
  }

  render() {
    const { airing } = this.props;
    const { opened, exportInc, exportLbl } = this.state;

    return (
      <>
        <Button
          variant="outline-secondary"
          size="xs"
          onClick={this.show}
          title="Export Video"
        >
          <span className="fa fa-download" />
        </Button>

        <Modal
          size="lg"
          show={opened}
          onHide={this.cancelProcess}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Exporting:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <Title airing={airing} />
              </Col>
            </Row>
            <Row>
              <Col>{airing.exportFile}</Col>
            </Row>
            <Row>
              <Col>
                <ExportProgress
                  process={this.processVideo}
                  inc={exportInc}
                  lbl={exportLbl}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <ExportButton
              inc={exportInc}
              cancel={this.cancelProcess}
              process={this.processVideo}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

/**
 * @return {string}
 */
function ExportButton(prop) {
  const { inc, cancel, process } = prop;

  if (inc === -2) {
    return (
      <Button variant="success" onClick={cancel}>
        Done
      </Button>
    );
  }
  if (inc === -1) {
    return (
      <Button variant="primary" onClick={process}>
        Export
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={cancel}>
      Cancel
    </Button>
  );
}

function ExportProgress(data) {
  const { inc, lbl, process } = data;

  if (inc === -1) {
    return (
      <Button variant="primary" onClick={process}>
        Start Export
      </Button>
    );
  }
  if (inc === -2) {
    return <Alert variant="success">Finished!</Alert>;
  }

  const pctLbl = `${Math.round(inc)} %`;
  return (
    <>
      <ProgressBar animated max="100" now={inc} label={pctLbl} />
      <span className="d-flex justify-content-center">{lbl}</span>
    </>
  );
}
