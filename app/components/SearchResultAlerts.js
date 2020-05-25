import React, { Component } from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import type { SearchAlert } from './Search';
import MatchesToBadges from './SearchFilterMatches';
import * as ActionListActions from '../actions/actionList';

type State = {};
type Props = {
  alert: SearchAlert,
  loading: boolean,
  airingList: Array<Airirng>,
  bulkAddAirings: (airings: Array<Airing>) => void,
  bulkRemAirings: () => void
};

class SearchResultAlerts extends Component<Props, State> {
  props: Props;

  render() {
    const {
      alert,
      loading,
      airingList,
      bulkAddAirings,
      bulkRemAirings
    } = this.props;

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
                matches={alert.stats}
                prefix="result_stats"
                className="bg-secondary"
              />
            </div>
            <div className="d-inline-block float-right pr-3">
              <Button
                variant="outline-secondary"
                className="mr-1"
                size="xs"
                onClick={() => bulkAddAirings(airingList)}
              >
                <span className="fa fa-plus" /> all
              </Button>
              <Button
                variant="outline-secondary"
                size="xs"
                onClick={() => bulkRemAirings(airingList)}
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

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect(null, mapDispatchToProps)(SearchResultAlerts);
