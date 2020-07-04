// @flow
import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import fs from 'fs';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import * as ExportListActions from '../actions/exportList';

import clockStyles from './Clock.css';
import TitleSlim from './TitleSlim';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import {
  EXP_WAITING,
  EXP_WORKING,
  EXP_DONE,
  EXP_CANCEL,
  EXP_FAIL,
  EXP_DELETE,
  NamingTemplateType
} from '../constants/app';

import ExportRecordType from '../reducers/types';

import { readableBytes, secondsToTimeStr } from '../utils/utils';
import RelativeDate from './RelativeDate';
import FilenameEditor from './FilenameEditor';
import OpenDirectory from './OpenDirecory';

type Props = {
  record: ExportRecordType,
  airing: Airing,
  updateExportRecord: ExportRecordType => void
};

type State = {};

class RecordingExport extends Component<Props, State> {
  props: Props;

  componentDidUpdate(prevProps: Props) {
    const { record } = this.props;
    if (prevProps.record !== record) {
      this.render();
    }
  }

  updateTemplate = (template: NamingTemplateType) => {
    const { record, updateExportRecord } = this.props;
    record.airing.template = template;
    updateExportRecord(record);
  };

  render() {
    const { record } = this.props;
    const { exportInc, exportLabel, duration, log } = record.progress;
    const { airing, state: exportState } = record;

    const classes = `border pb-1 mb-2 pt-1`;

    return (
      <Container className={classes}>
        <Row>
          <Col md="1">
            <TabloImage
              imageId={airing.show.thumbnail}
              className="menu-image-lg"
            />
          </Col>
          <Col md="11">
            <Row>
              <Col md="6">
                <TitleSlim airing={airing} withShow={1} />
              </Col>
              <Col md="6">
                <ExportProgress
                  label={exportLabel}
                  state={exportState}
                  inc={exportInc}
                  ffmpegLog={log}
                  time={duration}
                />
              </Col>
            </Row>
            <Row>
              <Col md="auto">
                <FileInfo
                  airing={airing}
                  exportState={exportState}
                  updateTemplate={this.updateTemplate}
                />
              </Col>
            </Row>
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
        style={{ maxHeight: '30px' }}
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
    </Alert>
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

// this is essentially a basic stick an array of strings in a modal
function FfmpegLog(prop) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { log } = prop;

  // const log = [];
  // for (let i = 0; i < 100; i += 1) log.push('xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx ');

  if (!log || log.length === 0) return <i>No log</i>;

  let i = 0;
  return (
    <>
      <Button size="xs" variant="primary" onClick={handleShow}>
        <span className="fa fa-info-circle" /> log
      </Button>

      <Modal size="lg" show={show} onHide={handleClose} scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Export Log</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-monospace smaller">
          {log.map(row => {
            i += 1;
            return (
              <div className="border-bottom" key={`logrow-${i}`}>
                {row}
              </div>
            );
          })}
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

type FileInfoProps = {
  airing: Airing,
  exportState: number,
  updateTemplate: (template: NamingTemplateType) => void
};

const FileInfo = (props: FileInfoProps) => {
  const { airing, exportState, updateTemplate } = props;
  const exists = fs.existsSync(airing.exportFile);

  if (!exists) {
    if (exportState === EXP_DONE) {
      return (
        <div className="p-0 m-0 smaller font-weight-bold text-danger">
          <span className="fa fa-exclamation pr-1" />
          <span className="pr-2">File does not exist after export.</span>
          <span>
            <OpenDirectory path={airing.exportFile} />
            {airing.exportFile}
          </span>
        </div>
      );
    }
    return (
      <div className="p-0 m-0 smaller font-weight-bold text-success">
        <span className="fa fa-check-circle pr-1" />
        {airing.exportFile}
        {exportState === EXP_WAITING ? (
          <>
            <FilenameEditor airing={airing} updateTemplate={updateTemplate} />
            <OpenDirectory path={airing.exportFile} />
          </> //
        ) : (
          ''
        )}
      </div>
    );
  }
  const stats = fs.statSync(airing.exportFile);

  let showSize = true;
  let baseClass = 'p-0 m-0 smaller font-weight-bold';
  let icon = 'fa pr-1 ';
  if (exportState === EXP_WORKING) {
    showSize = false;
    baseClass = `${baseClass} text-warning`;
    icon = `${icon} fa-exclamation`;
  } else if (exportState === EXP_DONE || exportState === EXP_DELETE) {
    showSize = true;
    baseClass = `${baseClass} text-success`;
    icon = `${icon} fa-check-circle`;
  } else {
    showSize = true;
    baseClass = `${baseClass} text-danger`;
    icon = `${icon} fa-exclamation`;
  }

  return (
    <div className={baseClass}>
      <span className={icon} />
      <span className="">{airing.exportFile}</span>
      <FilenameEditor airing={airing} updateTemplate={updateTemplate} />
      <OpenDirectory path={airing.exportFile} />
      <span className="pr-1">
        created <RelativeDate date={stats.ctime} />
      </span>
      {showSize ? (
        <span className="pr-1">({readableBytes(stats.size)})</span>
      ) : (
        ''
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { exportList } = state;
  const { airing } = ownProps;
  const record = exportList.exportList.find(
    rec => rec.airing.object_id === airing.object_id
  );

  return {
    record
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ ...ExportListActions }, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(RecordingExport);
