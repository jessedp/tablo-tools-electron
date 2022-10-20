import { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Badge, Alert } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

import Airing from '../utils/Airing';
import RecordingSlim from './RecordingSlim';
import Show from '../utils/Show';
import * as ActionListActions from '../store/actionList';
import { ON, OFF } from '../constants/app';
import { StdObj } from '../constants/types';

interface Props extends PropsFromRedux {
  // eslint-disable-next-line react/no-unused-prop-types
  show: Show;
  seasonNumber: number;
  selectedCount: number;
  airings: Array<Airing>;
  ref: any;
  refKey: any;
}
type State = Record<string, unknown>;

class SeasonEpisodeList extends Component<Props, State> {
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
      bulkRemAirings,
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
              size={'xs' as any}
              className="ml-4 mr-2"
              variant="outline-secondary"
              onClick={() => bulkAddAirings(airings.map((a) => a.data))}
            >
              <span className="fa fa-plus" /> All
            </Button>
            <Button
              size={'xs' as any}
              className="mr-2"
              variant="outline-secondary"
              onClick={() => bulkRemAirings(airings.map((a) => a.data))}
            >
              <span className="fa fa-minus" /> All
            </Button>

            <div className="text-secondary ml-3 d-inline-block smaller">
              <span className="fa fa-shopping-cart pr-2" />
              {selectedCount}
            </div>
          </Alert>
        </div>
        {airings.map((airing) => {
          return (
            <RecordingSlim
              key={airing.object_id}
              airing={airing}
              doDelete={() => undefined}
              withShow={OFF}
              withSelect={ON}
            />
          );
        })}
      </> //
    );
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  const { show, seasonNumber } = ownProps;
  //
  const selectedCount = state.actionList.records.reduce(
    (a: number, b: StdObj) =>
      a +
      (b.show?.object_id === show?.object_id &&
      parseInt(b.episode.season_number, 10) === parseInt(seasonNumber, 10)
        ? 1
        : 0),
    0
  );
  return {
    selectedCount,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SeasonEpisodeList);
