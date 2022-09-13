import { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import type { SearchAlert } from '../utils/types';
import MatchesToBadges from './SearchFilterMatches';
import * as ActionListActions from '../store/actionList';

type State = Record<string, unknown>;

interface Props extends PropsFromRedux {
  alert: SearchAlert;
  loading: boolean;
}

class SearchResultAlerts extends Component<Props, State> {
  render() {
    const { alert, loading, results, bulkAddAirings, bulkRemAirings } =
      this.props;
    if (loading || !alert || !alert.matches) return '';
    return (
      <Row>
        <Col>
          <Alert variant={alert.type}>
            <span className="pr-2">{alert.text}</span>
            <MatchesToBadges
              matches={alert.matches}
              prefix="result_matches"
              className=""
            />

            <div className="d-inline-block float-right">
              <MatchesToBadges
                matches={alert.stats || []}
                prefix="result_stats"
                className="bg-secondary"
              />
            </div>
            <div className="d-inline-block float-right pr-3">
              <Button
                variant="outline-secondary"
                className="mr-1"
                size={'xs' as any}
                onClick={() => bulkAddAirings(results)}
              >
                <span className="fa fa-plus" /> all
              </Button>
              <Button
                variant="outline-secondary"
                size={'xs' as any}
                onClick={() => bulkRemAirings(results)}
              >
                <span className="fa fa-minus" /> all
              </Button>
            </div>
          </Alert>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    results: state.search.results,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SearchResultAlerts);
