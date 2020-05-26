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

type Props = {
  doDelete: () => void,
  airing: Airing,
  checked: number,
  addAiring: Airing => void,
  remAiring: Airing => void,
  withShow?: number,
  progress?: Object
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
    console.log('recslim CDU');
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
    const { airing, checked, withShow, progress } = this.props;

    // const classes = `border pb-1 mb-2 pt-1`;

    let showCol = '';
    if (withShow === 1) {
      showCol = (
        <Col md="1">
          <TabloImage imageId={airing.background} className="menu-image-md" />
        </Col>
      );
    }

    return (
      <>
        <Row className="border-bottom mb-1 pb-1">
          {showCol}
          <Col md="7">
            <TitleSlim airing={airing} withShow={withShow} />
          </Col>
          <Col md="5">
            <Row>
              <Col md="6">
                <div className="float-right">
                  <AiringStatus airing={airing} />
                </div>
              </Col>
              <Col md="4" className="p-0">
                <span className="smaller float-right">
                  <span className="fa fa-clock pr-1" />
                  {airing.actualDuration} / {airing.duration}
                </span>
              </Col>
              <Col md="2">
                <Checkbox
                  checked={checked}
                  handleChange={this.toggleSelection}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>{progress}</Col>
        </Row>
      </> //
    );
  }
}
RecordingSlim.defaultProps = {
  withShow: 0,
  progress: null
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
