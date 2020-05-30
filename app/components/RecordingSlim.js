// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as ActionListActions from '../actions/actionList';

import TitleSlim from './TitleSlim';
import AiringStatus from './AiringStatus';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';
import { ON, OFF } from '../constants/app';
import VideoExport from './VideoExportModal';
import TabloVideoPlayer from './TabloVideoPlayer';

type Props = {
  doDelete: () => void,
  airing: Airing,
  checked: number,
  addAiring: Airing => void,
  remAiring: Airing => void,
  withShow?: number,
  withSelect?: number
};

class RecordingSlim extends Component<Props> {
  props: Props;

  static defaultProps: {};

  constructor(props: Props) {
    super();
    this.props = props;

    this.deleteAiring = this.deleteAiring.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { checked } = this.props;
    if (prevProps.checked !== checked) {
      this.render();
    }
  }

  deleteAiring = async () => {
    const { airing, doDelete } = this.props;
    await airing.delete();
    doDelete();
  };

  toggleSelection = async () => {
    const { airing, checked, addAiring, remAiring } = this.props;
    if (checked === CHECKBOX_ON) remAiring(airing);
    else addAiring(airing);
  };

  render() {
    const { airing, checked, withShow, withSelect } = this.props;

    // const classes = `border pb-1 mb-2 pt-1`;

    let showCol = '';
    let chkCol = '';
    if (withShow === ON) {
      showCol = (
        <div className="d-inline-block align-top mr-2 ">
          <TabloImage imageId={airing.image} className="menu-image-md" />
        </div>
      );
    }

    if (withSelect === ON) {
      chkCol = (
        <div className="pl-2 pt-1 d-inline-block">
          <Checkbox checked={checked} handleChange={this.toggleSelection} />
        </div>
      );
    }

    return (
      <>
        <Row className="border-bottom mb-1 pb-1 pr-2" style={{ width: '100%' }}>
          <Col md="8">
            {showCol}
            <TitleSlim airing={airing} withShow={OFF} />
          </Col>
          <Col md="4">
            <div className="">
              <div className="d-flex flex-row-reverse d-block">
                {chkCol}
                <div className="smaller text-secondary align-top d-inline-block pt-1">
                  <span className="fa fa-clock pr-1" />
                  {airing.actualDuration} / {airing.duration}
                </div>
                <div className="d-inline-block mr-3">
                  <AiringStatus airing={airing} />
                </div>
              </div>
            </div>

            <div className="d-flex flex-row-reverse">
              <VideoExport airingList={[airing]} />
              &nbsp;
              <TabloVideoPlayer airing={airing} />
            </div>
          </Col>
        </Row>
      </> //
    );
  }
}
RecordingSlim.defaultProps = {
  withShow: OFF,
  withSelect: OFF
};

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  const { airing } = ownProps;
  return {
    checked: actionList.find(item => item.object_id === airing.object_id)
      ? CHECKBOX_ON
      : CHECKBOX_OFF
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(RecordingSlim);
