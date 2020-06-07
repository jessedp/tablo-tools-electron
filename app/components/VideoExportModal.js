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

import VideoExport from './VideoExport';

import ExportRecordType from '../reducers/types';
import * as ExportListActions from '../actions/exportList';
import { EXP_WORKING, EXP_DONE } from '../constants/app';

import RecordingExport from './RecordingExport';
import Airing from '../utils/Airing';
import { ExportRecord } from '../utils/factories';

type Props = {
  airingList: Array<Airing>,
  exportList: Array<ExportRecordType>,
  label?: string,

  atOnceChange: (event: SyntheticEvent<HTMLInputElement>) => void,
  exportState: number,
  atOnce: number,
  deleteOnFinished: number,
  toggleDOF: () => void,
  cancelProcess: () => void,
  processVideo: () => void,

  addExportRecord: (record: ExportRecordType) => void,
  bulkRemExportRecord: (Array<ExportRecordType>) => void
};

type State = { opened: boolean };

class VideoExportModal extends Component<Props, State> {
  props: Props;

  static defaultProps: {};

  shouldCancel: boolean;

  timings: Object;

  constructor() {
    super();
    this.state = { opened: false };

    (this: any).show = this.show.bind(this);
    (this: any).close = this.close.bind(this);
  }

  close = async () => {
    const { bulkRemExportRecord } = this.props;
    this.shouldCancel = false;
    bulkRemExportRecord([]);
    this.setState({ opened: false });
  };

  show() {
    const { airingList, addExportRecord } = this.props;
    airingList.forEach(rec => {
      addExportRecord(ExportRecord(rec));
    });
    this.setState({ opened: true });
  }

  render() {
    const {
      exportList,
      exportState,
      atOnce,
      deleteOnFinished,
      atOnceChange,
      cancelProcess,
      processVideo,
      toggleDOF
    } = this.props;
    let { label } = this.props;

    const { opened } = this.state;

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
              deleteOnFinished={deleteOnFinished}
              toggleDOF={toggleDOF}
              atOnceChange={atOnceChange}
              cancel={cancelProcess}
              process={processVideo}
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
)(VideoExport(VideoExportModal));
