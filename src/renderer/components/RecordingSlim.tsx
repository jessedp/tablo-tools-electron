import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as ActionListActions from '../store/actionList';
import TitleSlim from './TitleSlim';
import AiringStatus from './AiringStatus';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';
import { ON, OFF, StdObj } from '../constants/app';
import VideoExportModal from './VideoExportModal';
import TabloVideoPlayer from './TabloVideoPlayer';
import AiringDetailsModal from './AiringDetailsModal';
import ConfirmDelete from './ConfirmDelete';

type OwnProps = {
  doDelete?: () => void;
  airing: Airing;

  withShow?: number;
  withSelect?: number;
  withActions?: number;
};

type StateProps = {
  checked: number;
};

type DispatchProps = {
  addAiring: (arg0: StdObj) => void;
  remAiring: (arg0: StdObj) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class RecordingSlim extends Component<Props> {
  static defaultProps: Record<string, any>;

  constructor(props: Props) {
    super(props);
    // this.props = props;
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
    // shouldn't have to do this?
    if (doDelete) doDelete();
  };

  toggleSelection = async () => {
    const { airing, checked, addAiring, remAiring } = this.props;
    if (checked === CHECKBOX_ON) remAiring(airing.data);
    else addAiring(airing.data);
  };

  render() {
    const { airing, checked, withShow, withSelect, withActions } = this.props;
    // const classes = `border pb-1 mb-2 pt-1`;
    let showCol = <></>;
    let chkCol = <></>;

    if (withShow === ON) {
      showCol = (
        <div className="d-inline-block align-top mr-2 ">
          <TabloImage imageId={airing.thumbnail} className="menu-image-md" />
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
        <Row
          className="border-bottom mb-1 pb-1 pr-2"
          style={{
            width: '100%',
            maxHeight: '55px',
          }}
        >
          <Col md="8">
            {showCol}
            <TitleSlim airing={airing} withShow={OFF} />
          </Col>
          <Col md="4">
            <div className="">
              <div className="d-flex flex-row-reverse d-block">
                {chkCol}
                <div
                  className="smaller text-secondary align-top d-inline-block pt-1"
                  style={{
                    width: '110px',
                  }}
                >
                  <span className="fa fa-clock pr-2 " />
                  <span>
                    {airing.actualDuration} / {airing.duration}
                  </span>
                </div>
                <div className="d-inline-block mr-3">
                  <AiringStatus airing={airing} />
                </div>
              </div>
            </div>
            {withActions === ON ? (
              <div className="d-flex flex-row-reverse">
                <ConfirmDelete airing={airing} />
                &nbsp;
                <VideoExportModal airing={airing} />
                &nbsp;
                <TabloVideoPlayer airing={airing} />
                &nbsp;
                <AiringDetailsModal airing={airing} />
              </div>
            ) : (
              ''
            )}
          </Col>
        </Row>
      </> //
    );
  }
}

RecordingSlim.defaultProps = {
  doDelete: () => undefined,
  withShow: OFF,
  withSelect: OFF,
  withActions: ON,
};

const mapStateToProps = (state: any, ownProps: OwnProps) => {
  const { actionList } = state;
  const { airing } = ownProps;
  return {
    checked: actionList.records.find(
      (item: StdObj) => item.object_id === airing.object_id
    )
      ? CHECKBOX_ON
      : CHECKBOX_OFF,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(RecordingSlim);
