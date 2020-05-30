import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Button, Badge, Row, Col } from 'react-bootstrap';
import * as ActionListActions from '../actions/actionList';
import { ON, OFF, ProgramData, NO } from '../constants/app';
import RecordingSlim from './RecordingSlim';
import ProgramCover from './ProgramCover';

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  rec: ProgramData,
  search: string => void,
  selectedCount: number,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void
};

type State = {};

class ProgramEpisodeList extends Component<Props, State> {
  props: Props;

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;
    if (prevProps.selectedCount !== selectedCount) {
      this.render();
    }
  }

  render() {
    const {
      rec,
      search,
      selectedCount,
      bulkAddAirings,
      bulkRemAirings
    } = this.props;
    const { airings } = rec;
    return (
      <div className="section">
        <div>
          <Button onClick={() => search('')} variant="outline-dark">
            <i className="fa fa-arrow-left" />
            <span className="pl-1">Back to Programs</span>
          </Button>
        </div>
        <Row className="mt-2 pb-2 border-bottom">
          <Col md="auto">
            <ProgramCover rec={rec} showCheckbox={NO} search={() => {}} />
          </Col>
          <Col>
            <Row className="mb-2 pt-5">
              <Col>
                <Badge className="p-2" variant="dark">
                  {airings.length} episode{airings.length > 1 ? 's' : ''}
                </Badge>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  size="xs"
                  className=" mr-2"
                  variant="outline-secondary"
                  onClick={() => bulkAddAirings(airings)}
                >
                  <span className="fa fa-plus" /> All Episodes
                </Button>
                <Button
                  size="xs"
                  className="mr-2"
                  variant="outline-secondary"
                  onClick={() => bulkRemAirings(airings)}
                >
                  <span className="fa fa-minus" /> All Episodes
                </Button>
                <div className="text-secondary ml-3 d-inline-block smaller">
                  <span className="fa fa-shopping-cart pr-2" />
                  {selectedCount}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        {airings.map(airing => {
          return (
            <RecordingSlim
              key={airing.object_id}
              airing={airing}
              doDelete={() => {}}
              withShow={OFF}
              withSelect={ON}
            />
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  const { rec } = ownProps;
  const { airings } = rec;

  let selectedCount = 0;
  if (airings) {
    selectedCount = actionList.reduce(
      (a, b) =>
        a + (airings.find(obj => obj.object_id === b.object_id) ? 1 : 0),
      0
    );
  }
  return {
    selectedCount
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramEpisodeList);
