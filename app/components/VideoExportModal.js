// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import ExportRecordType from '../reducers/types';
import * as ExportListActions from '../actions/exportList';
import {
  EXP_WAITING,
  EXP_WORKING,
  EXP_DONE,
  EXP_CANCEL,
  EXP_FAIL
} from '../constants/app';

import RecordingExport from './RecordingExport';
import {
  throttleActions,
  timeStrToSeconds,
  readableDuration
} from '../utils/utils';
import Airing from '../utils/Airing';
import { ExportRecord } from '../utils/factories';

type Props = {
  airingList: Array<Airing>,
  exportList: Array<ExportRecordType>,
  label?: string,

  addExportRecord: (record: ExportRecordType) => void,
  updateExportRecord: (record: ExportRecordType) => void,
  bulkRemExportRecord: (Array<ExportRecordType>) => void
};

type State = { opened: boolean, exportState: number, atOnce: number };

class VideoExportModal extends Component<Props, State> {
  props: Props;

  static defaultProps: {};

  shouldCancel: boolean;

  timings: Object;

  constructor() {
    super();
    this.state = { opened: false, exportState: EXP_WAITING, atOnce: 1 };

    this.shouldCancel = false;
    this.timings = {};

    (this: any).toggle = this.toggle.bind(this);
    (this: any).show = this.show.bind(this);
    (this: any).processVideo = this.processVideo.bind(this);
    (this: any).cancelProcess = this.cancelProcess.bind(this);
    (this: any).close = this.close.bind(this);
  }

  componentWillUnmount() {
    this.cancelProcess(false);
  }

  atOnceChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ atOnce: parseInt(event.currentTarget.value, 10) });
  };

  processVideo = async () => {
    const { exportList } = this.props;
    const { exportState, atOnce } = this.state;

    if (exportState === EXP_DONE) return;
    await this.setState({ exportState: EXP_WORKING });

    const actions = [];

    exportList.forEach(rec => {
      actions.push(() => {
        if (this.shouldCancel === false)
          return rec.airing.processVideo(this.updateProgress);
      });
    });

    await throttleActions(actions, atOnce).then(results => {
      return results;
    });

    if (this.shouldCancel) {
      this.setState({ exportState: EXP_CANCEL });
    } else {
      this.setState({ exportState: EXP_DONE });
    }
  };

  updateProgress = (airingId: number, progress: Object) => {
    const { exportList, updateExportRecord } = this.props;
    const record: ExportRecordType = exportList.find(
      rec => rec.airing.object_id === airingId
    );
    if (!record || record.state === EXP_DONE) return;

    const { airing } = record;

    if (!this.timings[airing.id]) {
      this.timings[airing.id] = { start: Date.now(), duration: 0 };
    }
    const timing = this.timings[airing.id];

    if (progress.finished) {
      record.state = EXP_DONE;
      record.progress = {
        exportInc: 1000,
        exportLabel: 'Complete',
        log: progress.log
      };
    } else if (progress.cancelled) {
      record.state = EXP_CANCEL;
      record.progress = {
        exportInc: 0,
        exportLabel: 'Cancelled'
      };
    } else if (progress.failed) {
      record.state = EXP_FAIL;
      record.progress = {
        exportInc: 0,
        exportLabel: 'Failed'
      };
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

      record.state = EXP_WORKING;
      record.progress = {
        exportInc: pct,
        exportLabel: label
      };
    }

    timing.duration = Date.now() - timing.start;
    record.progress = { ...record.progress, ...timing };
    this.timings[airing.id] = timing;

    updateExportRecord(record);
  };

  cancelProcess = async (updateState: boolean = true) => {
    const { exportList } = this.props;

    this.shouldCancel = true;

    exportList.forEach(rec => {
      if (rec.state === EXP_WORKING) {
        rec.airing.cancelVideoProcess();
      }
    });

    if (updateState) this.setState({ exportState: EXP_CANCEL });
  };

  close = async () => {
    const { bulkRemExportRecord } = this.props;
    this.shouldCancel = false;
    bulkRemExportRecord([]);
    this.setState({ opened: false, exportState: EXP_WAITING });
  };

  show() {
    const { airingList, addExportRecord } = this.props;
    airingList.forEach(rec => {
      addExportRecord(ExportRecord(rec));
    });
    this.setState({ opened: true });
  }

  toggle() {
    const { opened } = this.state;
    this.setState({ opened: !opened });
  }

  render() {
    const { exportList } = this.props;
    let { label } = this.props;

    const { opened, exportState, atOnce } = this.state;

    let size = 'xs';
    if (label) {
      label = <span className="pl-1">{label}</span>;
      size = 'sm';
    }
    if (!exportList) {
      console.log('missing exportList!');
      return <></>; //
    }
    const airingList = exportList.map(rec => rec.airing);

    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    airingList.sort((a, b) => timeSort(a, b));

    return (
      <>
        <Button
          variant="outline-secondary"
          size={size}
          onClick={this.show}
          title="Export Video"
        >
          <span className="fa fa-download" />
          {label}
        </Button>
        <Modal
          size="1000"
          show={opened}
          onHide={this.close}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Export</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {airingList.map(airing => {
              return (
                <RecordingExport
                  airing={airing}
                  key={`RecordingExport-${airing.object_id}`}
                />
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <ExportButton
              state={exportState}
              atOnce={atOnce}
              atOnceChange={this.atOnceChange}
              cancel={this.cancelProcess}
              process={this.processVideo}
              close={this.close}
            />
          </Modal.Footer>
        </Modal>
      </> //
    );
  }
}
VideoExportModal.defaultProps = { label: '' };

/**
 * @return {string}
 */
function ExportButton(prop) {
  const { state, cancel, close, process, atOnce, atOnceChange } = prop;
  // , atOnce, atOnceChange

  if (state === EXP_WORKING) {
    return (
      <Button variant="secondary" onClick={cancel}>
        Cancel
      </Button>
    );
  }

  if (state === EXP_DONE) {
    return (
      <Button variant="secondary" onClick={close}>
        Close
      </Button>
    );
  }

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Row>
      <Col md="auto">
        <InputGroup size="sm" className="pt-1">
          <InputGroup.Prepend>
            <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
              <span className="fa fa-info pr-2" />
              Max:
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="select"
            value={atOnce}
            aria-describedby="btnState"
            onChange={atOnceChange}
            title="More than 2 is probably silly, but YOLO!"
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </Form.Control>
        </InputGroup>
      </Col>
      <Col md="auto">
        <Button variant="primary" onClick={process} className="mr-2">
          Export
        </Button>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => {
  const { exportList } = state;
  return {
    exportList: exportList.exportList
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ExportListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(VideoExportModal);
