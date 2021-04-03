// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

import Recording from './Recording';
import Airing, { ensureAiringArray } from '../utils/Airing';

import type { SearchAlert } from '../utils/types';
import SearchResultAlerts from './SearchResultAlerts';
import RecordingSlim from './RecordingSlim';
import { ON } from '../constants/app';

type Props = {
  results: Object
};

type State = {
  searchAlert: SearchAlert,
  airingList: Array<Airing>,
  view: string,
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
      view: '',
      searchAlert: {
        type: '',
        text: '',
        matches: []
      }
    };

    this.state = this.initialState;
    // this.delete = this.delete.bind(this);
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
      airingList: results.airingList,
      view: results.view
    });
  };

  render() {
    const { searchAlert, loading, view } = this.state;
    let { airingList } = this.state;

    airingList = ensureAiringArray(airingList);

    let rows = [];
    if (!loading) {
      rows = airingList.map(airing => {
        if (view === 'list') {
          return (
            <RecordingSlim
              key={`recording-${airing.object_id}`}
              airing={airing}
              withShow={ON}
              withSelect={ON}
              withActions={ON}
            />
          );
        }
        return (
          <Recording key={`recording-${airing.object_id}`} airing={airing} />
        );
      });
    }
    return (
      <div className="scrollable-area">
        <Loading loading={loading} />
        <SearchResultAlerts
          alert={searchAlert}
          loading={loading}
          airingList={airingList}
        />
        <Row className="m-1 mb-4">{rows}</Row>
      </div>
    );
  }
}

function Loading(prop) {
  const { loading } = prop;
  if (!loading) return <></>; //

  return (
    <div
      className="d-flex justify-content-center"
      style={{ maxWidth: '400px', marginTop: '75px' }}
    >
      <Spinner animation="border" size="xl" variant="primary" />
    </div>
  );
}

const mapStateToProps = (state: any) => {
  return {
    results: state.results
  };
};

export default connect<*, *, *, *, *, *>(mapStateToProps)(SearchResults);
