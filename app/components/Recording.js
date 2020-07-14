// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import * as ActionListActions from '../actions/actionList';

import Title from './Title';
import TabloImage from './TabloImage';
import ConfirmDelete from './ConfirmDelete';
import TabloVideoPlayer from './TabloVideoPlayer';
import AiringStatus from './AiringStatus';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

import VideoExportModal from './VideoExportModal';
import Airing from '../utils/Airing';
import AiringDetailsModal from './AiringDetailsModal';
import { getTabloImageUrl } from '../utils/utils';

type Props = {
  airing: Airing,
  checked: number,
  addAiring: Airing => void,
  remAiring: Airing => void
};
type State = {};

class Recording extends Component<Props, State> {
  props: Props;

  // for 2 way interaction you're maybe not supposed to do for this reason
  // TODO: figure out the type.
  checkboxRef: any;

  constructor(props: Props) {
    super();
    this.props = props;

    this.checkboxRef = React.createRef();

    (this: any).toggleSelection = this.toggleSelection.bind(this);
    (this: any).processVideo = this.processVideo.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { checked } = this.props;
    if (prevProps.checked !== checked) {
      this.render();
    }
  }

  toggleSelection = async () => {
    const { airing, addAiring, remAiring } = this.props;

    // FIXME: gross, don't know if this is correct way to do this
    if (
      this.checkboxRef === null ||
      !Object.prototype.hasOwnProperty.call(this.checkboxRef, 'state')
    )
      return;

    const { state } = this.checkboxRef;
    if (!state) return;

    const { checked } = state;

    // we get this value before it's set, so the test is backwards
    if (!checked) {
      // await this.setState({ checked: CHECKBOX_ON });
      addAiring(airing);
    } else {
      // await this.setState({ checked: CHECKBOX_OFF });
      remAiring(airing);
    }
  };

  async processVideo() {
    const { airing } = this.props;
    await airing.processVideo();
  }

  render() {
    const { airing, checked } = this.props;
    const classes = `m-1 pt-1 search-box`;

    let checkbox = '';
    if (airing.videoDetails.state !== 'recording') {
      checkbox = (
        <Col md="1" className="mr-0 pr-1">
          <div className="float-right p-0 m-0">
            <Checkbox
              checked={checked}
              ref={checkboxRef => (this.checkboxRef = checkboxRef)}
              handleChange={this.toggleSelection}
            />
          </div>
        </Col>
      );
    }
    return (
      <Container className={classes}>
        <img
          alt="background"
          src={getTabloImageUrl(airing.show.background)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: 'auto',
            opacity: '0.2',
            zIndex: '-1',
            overflow: 'hidden',
            overflowY: 'hidden'
          }}
        />

        <Row>
          <Col md="3" className="ml-0 mr-0 pl-0 pr-0">
            <TabloImage
              imageId={airing.show.thumbnail}
              className="search-image"
            />
          </Col>
          <Col md="9" style={{ display: 'flex', flexDirection: 'column' }}>
            <Row>
              <Col md="11" className="ml-0 mr-0 pl-0 pr-0">
                <Title airing={airing} />
              </Col>
              {checkbox}
            </Row>

            <div style={{ flex: 1 }} />

            <Row>
              <Col md="auto" className="ml-0 mr-0 pl-0 pr-0">
                <span className="smaller">
                  <b>Duration: </b>
                  {airing.actualDuration} of {airing.duration}
                  <br />
                </span>
              </Col>
            </Row>

            <Row className="pb-1">
              <Col md="7" className="ml-0 pl-0 mr-0 pr-0">
                <AiringDetailsModal airing={airing} />
                &nbsp;
                <TabloVideoPlayer airing={airing} />
                &nbsp;
                <VideoExportModal airingList={[airing]} />
                &nbsp;
                <ConfirmDelete airing={airing} />
              </Col>
              <Col md="5" className="ml-0 pl-0 mr-0 pr-0">
                <div className="float-right">
                  <AiringStatus airing={airing} />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

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
)(Recording);
