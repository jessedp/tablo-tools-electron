import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { LinkContainer } from 'react-router-bootstrap';

import { Button, Badge, Row, Col } from 'react-bootstrap';
import * as ActionListActions from '../actions/actionList';
import { ON, OFF, ProgramData, NO } from '../constants/app';
import RecordingSlim from './RecordingSlim';
import ProgramCover from './ProgramCover';
import { programList } from './Programs';
import routes from '../constants/routes.json';

type Props = {
  selectedCount: number,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void,
  match: Object
};

type State = { rec: ProgramData | null };

class ProgramEpisodeList extends Component<Props, State> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = { rec: null };
  }

  componentDidMount = async () => {
    const { match } = this.props;

    const { path } = match.params;
    const rec = await programList(atob(path));
    this.refresh(rec);
  };

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;
    if (prevProps.selectedCount !== selectedCount) {
      this.render();
    }
  }

  refresh = (rec: ProgramData) => {
    this.setState({ rec });
  };

  render() {
    const { rec } = this.state;
    if (!rec) return <></>; //

    const { selectedCount, bulkAddAirings, bulkRemAirings } = this.props;
    const { airings } = rec;
    return (
      <div className="section">
        <div>
          <LinkContainer to={routes.PROGRAMS}>
            <Button size="xs" variant="outline-secondary" className="mt-1 mb-1">
              <span className="fa fa-arrow-left pr-2" />
              back
            </Button>
          </LinkContainer>
          <Row className="mt-2 pb-2 border-bottom">
            <Col md="auto">
              <Button variant="light" className="mr-3" onClick={() => {}}>
                <ProgramCover rec={rec} showCheckbox={NO} search={() => {}} />
              </Button>
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
        </div>
        <div className="scrollable-area">
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
      </div>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//   const { actionList } = state;
//   const { rec } = ownProps;
//   const { airings } = rec;

//   let selectedCount = 0;
//   if (airings) {
//     selectedCount = actionList.reduce(
//       (a, b) =>
//         a + (airings.find(obj => obj.object_id === b.object_id) ? 1 : 0),
//       0
//     );
//   }
//   return {
//     selectedCount
//   };
// };

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect(
  null,
  mapDispatchToProps
)(withRouter(ProgramEpisodeList));
