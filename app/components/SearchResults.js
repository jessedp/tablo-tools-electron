// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

import Recording from './Recording';
import Airing, { ensureAiringArray } from '../utils/Airing';
import { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';
import type { SearchAlert } from './Search';
import MatchesToBadges from './SearchFilterMatches';

type Props = {
  addItem: (airing: Airing) => void,
  delItem: (airing: Airing) => void,
  refresh: () => void
};

type State = {
  searchAlert: SearchAlert,
  airingList: Array<Airing>,
  airingRefs: Object,
  actionList: Array<Airing>,
  loading: boolean
};

export default class SearchResults extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = {
      airingRefs: {},
      actionList: [],
      loading: false,
      airingList: [],
      searchAlert: {
        type: '',
        text: '',
        matches: []
      }
    };

    this.state = this.initialState;

    this.addItem = this.addItem.bind(this);
    this.delItem = this.delItem.bind(this);
    // this.search = this.search.bind(this);
    this.delete = this.delete.bind(this);
  }

  receiveResults = (records: Object) => {
    const refs = {};
    if (records.airingList) {
      records.airingList.forEach(item => {
        refs[item.object_id] = React.createRef();
      });
    }

    this.setState({
      searchAlert: records.searchAlert,
      loading: records.loading,
      actionList: records.actionList,
      airingList: records.airingList,
      airingRefs: refs
    });
  };

  addItem = (item: Airing) => {
    const { addItem } = this.props;
    addItem(item);
  };

  delItem = (item: Airing) => {
    const { delItem } = this.props;
    delItem(item);
  };

  toggle = (item: Airing, type: number) => {
    const { airingRefs } = this.state;
    if (airingRefs[item.object_id])
      airingRefs[item.object_id].current.checkboxRef.toggle(type);
  };

  selectAll = () => {
    const { airingRefs } = this.state;
    Object.keys(airingRefs).forEach(id => {
      if (airingRefs[id])
        if (typeof airingRefs[id].current.checkboxRef.toggle === 'function')
          airingRefs[id].current.checkboxRef.toggle(CHECKBOX_ON);
    });
  };

  unselectAll = () => {
    const { airingRefs } = this.state;
    Object.keys(airingRefs).forEach(id => {
      if (airingRefs[id])
        if (typeof airingRefs[id].current.checkboxRef.toggle === 'function')
          // typeof check is because there are no checkboxes on episodes being recorded
          airingRefs[id].current.checkboxRef.toggle(CHECKBOX_OFF);
    });
  };

  delete = async () => {
    const { refresh } = this.props;
    // TODO: make this work if need be
    await refresh();
  };

  render() {
    const { refresh } = this.props;
    const { searchAlert, actionList, loading, airingRefs } = this.state;
    let { airingList } = this.state;

    airingList = ensureAiringArray(airingList);

    const rows = [];
    if (!loading) {
      rows.push(
        airingList.map(airing => {
          let checked = CHECKBOX_OFF;
          if (actionList.find(item => item.object_id === airing.object_id)) {
            checked = CHECKBOX_ON;
          }

          return (
            <Recording
              key={`recording-${airing.object_id}`}
              ref={airingRefs[airing.object_id]}
              search={refresh}
              doDelete={this.delete}
              airing={airing}
              addItem={this.addItem}
              delItem={this.delItem}
              checked={checked}
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
      className="d-flex justify-content-center m-0 p-0 mt-5"
      style={{ maxWidth: '400px' }}
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
          <MatchesToBadges matches={alert.matches} prefix="result" />
        </Alert>
      </Col>
    </Row>
  );
}
