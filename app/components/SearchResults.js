// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

import { Button } from 'react-bootstrap';
import Recording from './Recording';
import Airing, { ensureAiringArray } from '../utils/Airing';

import type { SearchAlert } from './Search';
import MatchesToBadges from './SearchFilterMatches';
import * as ActionListActions from '../actions/actionList';

type Props = {
  refresh: () => void,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void,
  results: Object
};

type State = {
  searchAlert: SearchAlert,
  airingList: Array<Airing>,
  loading: boolean
};

class SearchResults extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = {
      loading: false,
      airingList: [],
      searchAlert: {
        type: '',
        text: '',
        matches: []
      }
    };

    this.state = this.initialState;
    this.delete = this.delete.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { results } = this.props;
    if (prevProps.results !== results) {
      this.refresh();
    }
  }

  refresh = () => {
    const { results } = this.props;
    this.setState({
      searchAlert: results.searchAlert,
      loading: results.loading,
      airingList: results.airingList
    });
  };

  delete = async () => {
    const { refresh } = this.props;
    // TODO: See if this is necessary
    await refresh();
  };

  render() {
    const { refresh, bulkAddAirings, bulkRemAirings } = this.props;
    const { searchAlert, loading } = this.state;
    let { airingList } = this.state;

    airingList = ensureAiringArray(airingList);

    const rows = [];
    if (!loading) {
      rows.push(
        airingList.map(airing => {
          return (
            <Recording
              key={`recording-${airing.object_id}`}
              search={refresh}
              doDelete={this.delete}
              airing={airing}
            />
          );
        })
      );
    }
    return (
      <div className="scrollable-area">
        <Loading loading={loading} />
        <ShowAlerts
          alert={searchAlert}
          loading={loading}
          bulkAddAirings={bulkAddAirings}
          bulkRemAirings={bulkRemAirings}
        />
        <Row className="m-1 mb-4">{rows}</Row>
      </div>
    );
  }
}

function Loading(prop) {
  const { loading } = prop;
  if (!loading) return <></>;

  return (
    <div
      className="d-flex justify-content-center"
      style={{ maxWidth: '400px', marginTop: '75px' }}
    >
      <Spinner animation="border" size="xl" variant="primary" />
    </div>
  );
}

function ShowAlerts(prop) {
  const { alert, loading, bulkAddAirings, bulkRemAirings } = prop;

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
              onClick={bulkAddAirings}
            >
              <span className="fa fa-plus" /> all
            </Button>
            <Button
              variant="outline-secondary"
              size="xs"
              onClick={bulkRemAirings}
            >
              <span className="fa fa-minus" /> all
            </Button>
          </div>
        </Alert>
      </Col>
    </Row>
  );
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    results: state.results
  };
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(SearchResults);
