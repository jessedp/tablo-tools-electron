import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

import ProgressBar from 'react-bootstrap/ProgressBar';

import Spinner from 'react-bootstrap/Spinner';

import {
  EXP_WAITING,
  EXP_DONE,
  EXP_CANCEL,
  EXP_FAIL,
  EXP_DELETE,
} from '../constants/app';
import { secondsToTimeStr } from '../utils/utils';

import FfmpegLog from './FfmpegLog';
import './Clock.css';

function Timer(prop: { timeStr: string }) {
  const { timeStr } = prop;
  const parts = timeStr.split(':');
  // console.log(parts);
  return (
    <div className="clock">
      <span>{parts[0]}</span>
      <span>{parts[1]}</span>
      <span>{parts[2]}</span>
    </div>
  );
}

type EPProp = {
  inc: number;
  state: number;
  label: string;
  time: number;
  ffmpegLog: [];
};

export default function ExportProgress(prop: EPProp) {
  const { inc, label, state, time, ffmpegLog } = prop;
  const timeStr = secondsToTimeStr(`${time / 1000}`, ':');

  if (state === EXP_WAITING) {
    return (
      <Alert variant="light" className="m-0 pt-3 smallerish export-alert">
        <span className="">
          <span className="fa fa-pause-circle" /> waiting...
        </span>
      </Alert>
    );
  }

  if (state === EXP_DONE) {
    return (
      <Alert variant="success" className="m-0 smallerish export-alert">
        <Row>
          <Col md="8">
            <span className="fa fa-check-circle pr-2" />
            <span className="pr-5">Finished in {timeStr}</span>
          </Col>
          <Col md="4" className="text-right">
            <FfmpegLog log={ffmpegLog} />
          </Col>
        </Row>
      </Alert>
    );
  }

  if (state === EXP_DELETE) {
    return (
      <Alert variant="secondary" className="m-0 smallerish export-alert">
        <Row>
          <Col md="8">
            <span className="fa fa-check-circle pr-2" />
            <span className="pr-5">
              Finished in {timeStr}. DELETED from Tablo.
            </span>
          </Col>
          <Col md="4" className="text-right">
            <FfmpegLog log={ffmpegLog} />
          </Col>
        </Row>
      </Alert>
    );
  }

  if (state === EXP_CANCEL) {
    return (
      <Alert variant="warning" className="m-0 smallerish export-alert">
        <Row>
          <Col md="9">
            <span className="fa fa-check-circle pr-2" />
            <span className="pr-5">Canceled after {timeStr}</span>
          </Col>
          <Col md="3" className="text-right">
            <FfmpegLog log={ffmpegLog} />
          </Col>
        </Row>
      </Alert>
    );
  }

  if (state === EXP_FAIL) {
    return (
      <Alert variant="danger " className="m-0 smallerish export-alert">
        <Row>
          <Col md="9">
            <span className="fa fa-check-circle pr-2" />
            <span className="pr-5">Failed after {timeStr}</span>
          </Col>
          <Col md="3" className="text-right">
            <FfmpegLog log={ffmpegLog} />
          </Col>
        </Row>
      </Alert>
    );
  }

  if (inc === 0) {
    return (
      <Alert
        variant="light"
        className="m-0 smallerish export-alert"
        style={{
          maxHeight: '30px',
        }}
      >
        <Spinner
          size="sm"
          animation="border"
          variant="warning"
          className="mt-1"
        />
      </Alert>
    );
  }

  // if (exportState === EXP_WORKING)
  const pctLbl = `${Math.round(inc)} %`;
  return (
    <Alert variant="light " className="smallerish m-0 export-alert">
      <div className="d-flex flex-row pt-1">
        <div
          style={{
            width: '100%',
          }}
        >
          <ProgressBar
            animated
            max={100}
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
    </Alert>
  );
}
