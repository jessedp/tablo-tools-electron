// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Button } from 'react-bootstrap';
import * as ActionListActions from '../actions/actionList';
import Airing from '../utils/Airing';

import routes from '../constants/routes.json';

import { getTabloImageUrl } from '../utils/utils';
import TabloImage from './TabloImage';

import AiringDetailsModal from './AiringDetailsModal';
import TabloVideoPlayer from './TabloVideoPlayer';
import VideoExportModal from './VideoExportModal';

type Props = {
  selectedCount: number,
  addAiring: Airing => void,
  remAiring: Airing => void,
  match: any
};

type State = {
  event: Airing | null
};

class SportDetails extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();
    this.initialState = {
      event: null
    };

    this.state = this.initialState;

    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    // eslint-disable-next-line
    const id = parseInt(this.props.match.params.id, 10);
    const rec = await global.RecDb.asyncFindOne({
      object_id: id
    });

    const movie = await Airing.create(rec);

    this.refresh(movie);
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;
    if (prevProps.selectedCount !== selectedCount) {
      this.refresh();
    }
  }

  async refresh(event: Airing | null = null) {
    if (!event) return;

    this.setState({
      event
    });
  }

  render() {
    const { event } = this.state;
    const { selectedCount } = this.props;
    const { addAiring, remAiring } = this.props;

    if (!event) return <></>; //

    const { show } = event;

    return (
      <div className="section">
        <img
          alt="background"
          src={getTabloImageUrl(show.background)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: 'auto',
            opacity: '0.25',
            zIndex: '-1',
            maxHeight: '90vh'
          }}
        />

        <div>
          <LinkContainer to={routes.SPORTS} key={show.id}>
            <Button size="xs" variant="outline-secondary" className="mt-1 mb-1">
              <span className="fa fa-arrow-left pr-2" />
              back
            </Button>
          </LinkContainer>
          <Row>
            <Col md="auto" className="">
              <TabloImage
                imageId={show.thumbnail}
                className="cover-image"
                title={show.title}
              />
            </Col>

            <div className="show-cover">
              <Row className="pt-1">
                <Col md="auto">
                  <h2 className="text-primary">{show.title}</h2>
                </Col>
              </Row>

              <Row className="ml-0" style={{ height: '23px' }}>
                <AiringDetailsModal airing={event} />
                &nbsp;
                <TabloVideoPlayer airing={event} />
                &nbsp;
                <VideoExportModal airing={event} />
                <Button
                  size="xs"
                  className="ml-3 mr-2"
                  variant="outline-dark"
                  onClick={() => addAiring(event)}
                >
                  <span className="fa fa-plus" />
                </Button>
                <Button
                  size="xs"
                  className="mr-2"
                  variant="outline-dark"
                  onClick={() => remAiring(event)}
                >
                  <span className="fa fa-minus" />
                </Button>
                <div className="center-icon smaller text-dark">
                  <span className="fa fa-shopping-cart pr-2" />
                  {selectedCount}
                </div>
              </Row>

              <div className="p-3" style={{ maxWidth: '80vw' }}>
                <Row className="mt-3">
                  <Col>
                    <b>Description:</b>
                    <span className="ml-1">{show.sport.description}</span>
                  </Col>
                </Row>
              </div>

              <div>&nbsp;</div>
              <div>&nbsp;</div>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  //  const { show } = ownProps;
  // eslint-disable-next-line
  const id = parseInt(ownProps.match.params.id, 10);

  const selectedCount = actionList.reduce(
    (a, b) => a + (b.object_id === id || 0),
    0
  );
  return {
    selectedCount
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(SportDetails));
