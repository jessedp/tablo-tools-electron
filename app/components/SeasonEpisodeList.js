import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Button, Badge, Alert } from 'react-bootstrap';
import Airing from '../utils/Airing';
import RecordingSlim from './RecordingSlim';
import Show from '../utils/Show';
import * as ActionListActions from '../actions/actionList';

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  show: Show,
  seasonNumber: number,
  selectedCount: number,
  airings: Array<Airing>,
  ref: any,
  refKey: any,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void
};

type State = {};

class SeasonEpisodeList extends Component<Props, State> {
  props: Props;

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;
    if (prevProps.selectedCount !== selectedCount) {
      this.render();
    }
  }

  render() {
    const {
      seasonNumber,
      airings,
      selectedCount,
      ref,
      refKey,
      bulkAddAirings,
      bulkRemAirings
    } = this.props;

    return (
      <>
        <div className="pt-2" key={refKey} ref={ref}>
          <Alert variant="light">
            <span className="mr-3">Season {seasonNumber}</span>
            <Badge className="p-2" variant="primary">
              {airings.length} episode{airings.length > 1 ? 's' : ''}
            </Badge>

            <Button
              size="xs"
              className="ml-4 mr-2"
              variant="outline-secondary"
              onClick={() => bulkAddAirings(airings)}
            >
              <span className="fa fa-plus" /> All
            </Button>
            <Button
              size="xs"
              className="mr-2"
              variant="outline-secondary"
              onClick={() => bulkRemAirings(airings)}
            >
              <span className="fa fa-minus" /> All
            </Button>

            <div className="text-secondary ml-3 d-inline-block smaller">
              <span className="fa fa-shopping-cart pr-2" />
              {selectedCount}
            </div>
          </Alert>
        </div>
        {airings.map(airing => {
          return (
            <RecordingSlim
              key={airing.object_id}
              airing={airing}
              doDelete={() => {}}
              withShow={0}
            />
          );
        })}
      </> //
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  const { show, seasonNumber } = ownProps;

  //
  const selectedCount = actionList.reduce(
    (a, b) =>
      a +
      ((b.show.object_id === show.object_id &&
        parseInt(b.episode.season_number, 10) === parseInt(seasonNumber, 10)) ||
        0),
    0
  );
  return {
    selectedCount
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(SeasonEpisodeList);
