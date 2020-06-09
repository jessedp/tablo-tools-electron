// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { Alert } from 'react-bootstrap';
import Airing from '../utils/Airing';
import RecordingExport from './RecordingExport';
import * as ExportListActions from '../actions/exportList';

import VideoExport from './VideoExport';
import ExportRecordType from '../reducers/types';
import { EXP_WORKING } from '../constants/app';
import { ExportRecord } from '../utils/factories';
import Checkbox from './Checkbox';

type Props = {
  actionList: Array<Airing>,
  exportList: Array<ExportRecordType>,
  atOnceChange: (event: SyntheticEvent<HTMLInputElement>) => void,
  exportState: number,
  atOnce: number,
  deleteOnFinished: number,
  toggleDOF: () => void,
  cancelProcess: () => void,
  processVideo: () => void,

  addExportRecord: (record: ExportRecordType) => void,
  bulkRemExportRecord: (Array<ExportRecordType>) => void,

  history: any
};

class VideoExportPage extends Component<Props> {
  props: Props;

  componentDidMount() {
    const { actionList, addExportRecord } = this.props;
    actionList.forEach(rec => {
      addExportRecord(ExportRecord(rec));
    });
  }

  componentWillUnmount() {
    const { bulkRemExportRecord } = this.props;
    bulkRemExportRecord([]);
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
      toggleDOF,
      history
    } = this.props;

    if (exportList.length === 0) {
      return (
        <Alert variant="warning">
          <Button
            variant="light"
            onClick={() => history.goBack()}
            className="mr-2"
          >
            Go back
          </Button>
          No records selected!
        </Alert>
      );
    }

    const timeSort = (a, b) => {
      if (a.airing.airingDetails.datetime < b.airing.airingDetails.datetime)
        return 1;
      return -1;
    };

    exportList.sort((a, b) => timeSort(a, b));

    return (
      <>
        <Prompt
          when={exportState === EXP_WORKING}
          message="Leaving will CANCEL all Exports in progress. Are you sure?"
        />
        <ExportActions
          state={exportState}
          atOnce={atOnce}
          atOnceChange={atOnceChange}
          cancel={cancelProcess}
          process={processVideo}
          toggle={toggleDOF}
          deleteOnFinish={deleteOnFinished}
        />
        {exportList.map(rec => {
          return (
            <RecordingExport
              airing={rec.airing}
              key={`RecordingExport-${rec.airing.object_id}`}
            />
          );
        })}
      </> //
    );
  }
}

/**
 * @return {string}
 */
function ExportActions(prop) {
  const {
    state,
    cancel,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggle
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Alert variant="primary" className="p-2 m-2">
        <Row>
          <Col md="5" />
          <Col md="2">
            <Button variant="warning" onClick={cancel}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Alert>
    );
  }

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Alert variant="primary" className="p-2 m-2">
      <Row>
        <Col md="4" className="pt-2">
          <h4 className="pl-2">Export Recordings</h4>
        </Col>
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
          <Button variant="light" onClick={process} className="mr-2">
            Export
          </Button>
        </Col>
        <Col md="auto" className="pt-2">
          <Checkbox
            checked={deleteOnFinish}
            handleChange={toggle}
            label="Delete when finished?"
          />
        </Col>
      </Row>
    </Alert>
  );
}

const mapStateToProps = state => {
  const { exportList } = state;
  return {
    actionList: state.actionList,
    exportList: exportList.exportList
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ExportListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(VideoExport(VideoExportPage));
