// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

import Recording from './Recording';
import Airing, { ensureAiringArray } from '../utils/Airing';

import type { SearchAlert } from './Search';
import MatchesToBadges from './SearchFilterMatches';

type Props = {
  refresh: () => void
};

type State = {
  searchAlert: SearchAlert,
  airingList: Array<Airing>,
  loading: boolean
};

export default class SearchResults extends Component<Props, State> {
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

  receiveResults = (records: Object) => {
    this.setState({
      searchAlert: records.searchAlert,
      loading: records.loading,
      airingList: records.airingList
    });
  };

  delete = async () => {
    const { refresh } = this.props;
    // TODO: See if this is necessary
    await refresh();
  };

  render() {
    const { refresh } = this.props;
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
        <ShowAlerts alert={searchAlert} loading={loading} />
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
  const { alert, loading } = prop;

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
        </Alert>
      </Col>
    </Row>
  );
}
