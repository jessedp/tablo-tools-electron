// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Row, Col, Alert } from 'react-bootstrap';
import * as FlashActions from '../actions/flash';
import type { FlashRecordType } from '../reducers/types';

import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import getConfig, { setConfigItem } from '../utils/config';
import {
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_SKIP,
  DUPE_ADDID
} from '../constants/app';

type Props = { sendFlash: (message: FlashRecordType) => void };

type State = { actionOnDuplicate: string };

class SettingsExport extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { actionOnDuplicate: getConfig().actionOnDuplicate };
  }

  setConfigAndState = (obj: any) => {
    const { sendFlash } = this.props;
    setConfigItem(obj);
    this.setState(obj);
    sendFlash({
      message: `Default set to ${obj.actionOnDuplicate.toLowerCase()}`
    });
  };

  toggleInc = () => {
    this.setConfigAndState({ actionOnDuplicate: DUPE_INC });
  };

  toggleOverwrite = () => {
    this.setConfigAndState({ actionOnDuplicate: DUPE_OVERWRITE });
  };

  toggleSkip = () => {
    this.setConfigAndState({ actionOnDuplicate: DUPE_SKIP });
  };

  toggleAddId = () => {
    this.setConfigAndState({ actionOnDuplicate: DUPE_ADDID });
  };

  render() {
    const { actionOnDuplicate } = this.state;

    return (
      <div>
        <Alert size="sm" variant="light" className="p-1 pl-3">
          What should be done if the file already exists?
        </Alert>
        <Row className="mt-3">
          <Col md="6">
            <Checkbox
              handleChange={this.toggleInc}
              checked={
                actionOnDuplicate === DUPE_INC ? CHECKBOX_ON : CHECKBOX_OFF
              }
              label="Increment"
            />
            <div className="pl-4 smallerish">
              This will add <code>-#</code> to the filename...
              <code>test.mp4</code>, <code>test-1.mp4</code>,
              <code>test-2.mp4</code>, ...
            </div>
          </Col>
          <Col md="6">
            <Checkbox
              handleChange={this.toggleOverwrite}
              checked={
                actionOnDuplicate === DUPE_OVERWRITE
                  ? CHECKBOX_ON
                  : CHECKBOX_OFF
              }
              label="Overwrite"
            />
            <div className="pl-4 smallerish">Overwrite it.</div>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md="6">
            <Checkbox
              handleChange={this.toggleAddId}
              checked={
                actionOnDuplicate === DUPE_ADDID ? CHECKBOX_ON : CHECKBOX_OFF
              }
              label="Add object_id"
            />
            <div className="pl-4 smallerish">
              This will add <code>-X</code> where the X = the Tablo device
              object_id to the filename...
              <code>test.mp4</code>, <code>test-902732.mp4</code>,
              <code>test-902735.mp4.mp4</code>, ...
            </div>
          </Col>
          <Col md="6">
            <Checkbox
              handleChange={this.toggleSkip}
              checked={
                actionOnDuplicate === DUPE_SKIP ? CHECKBOX_ON : CHECKBOX_OFF
              }
              label="Skip"
            />
            <div className="pl-4 smallerish">
              Ignore the recording and don&apos;t export it.
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(SettingsExport);
