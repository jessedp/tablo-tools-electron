// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

import Recording from './Recording';
import Airing from '../utils/Airing';
import { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

type Props = {
  addItem: (airing: Airing) => void,
  delItem: (airing: Airing) => void
};

type State = {
  airingList: Array<Airing>,
  airingRefs: Object,
  actionList: Object,
  loading: boolean
};

export default class SearchResults extends Component<Props, State> {
  props: Props;

  constructor() {
    super();

    this.state = {
      airingRefs: {},
      actionList: {},
      loading: false,
      airingList: []
    };

    // const storedState = JSON.parse(localStorage.getItem('SearchState') || '{}');
    // delete storedState.recordingRefs;
    // const initialStateCopy = { ...this.initialState };
    // this.state = Object.assign(initialStateCopy, storedState);

    this.addItem = this.addItem.bind(this);
    this.delItem = this.delItem.bind(this);
    this.search = this.search.bind(this);
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
        airingRefs[id].current.checkboxRef.toggle(CHECKBOX_ON);
    });
  };

  unselectAll = () => {
    const { airingRefs } = this.state;
    Object.keys(airingRefs).forEach(id => {
      if (airingRefs[id])
        airingRefs[id].current.checkboxRef.toggle(CHECKBOX_OFF);
    });
  };

  delete = async () => {
    // TODO: make this work if need be
    await this.search();
  };

  search = async () => {
    // TODO: make this work if need be
    await this.search();
  };

  render() {
    const { actionList, loading, airingRefs, airingList } = this.state;

    // console.log('SearchResults render');

    const rows = [];
    if (!loading) {
      rows.push(
        airingList.map(airing => {
          let checked = CHECKBOX_OFF;
          if (
            !(typeof actionList === 'undefined') &&
            Object.keys(actionList).includes(`${airing.object_id}`)
          ) {
            checked = CHECKBOX_ON;
          }

          return (
            <Recording
              key={`recording-${airing.object_id}`}
              ref={airingRefs[airing.object_id]}
              search={this.search}
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
      <>
        <Loading loading={loading} />
        <Row className="m-1 mb-4">{rows}</Row>
      </>
    );
  }
}

function Loading(prop) {
  const { loading } = prop;
  if (!loading) return <></>;

  return (
    <Row>
      <Col md="6" className="">
        <div className="d-flex justify-content-center">
          <Spinner animation="grow" variant="warning" />
        </div>
      </Col>

      <Col md="6">&nbsp;</Col>
    </Row>
  );
}
