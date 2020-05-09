// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import { Alert } from 'react-bootstrap';
import Airing from '../utils/Airing';
import { asyncForEach } from '../utils/utils';
import ShowCover from './ShowCover';

type Props = {};
type State = { airings: Array<Airing>, alertType: string, alertTxt: string };

export default class Programs extends Component<Props, State> {
  props: Props;

  initialState: State;

  psToken: null;

  constructor() {
    super();

    this.state = { airings: [], alertType: '', alertTxt: '' };

    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.search();
    this.psToken = PubSub.subscribe('DB_CHANGE', () => {
      this.search();
    });
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  search = async () => {
    const recs = await programList();

    if (recs.length === 0) {
      this.setState({
        alertType: 'warning',
        alertTxt: 'No movies found',
        airings: []
      });
    } else {
      this.setState({
        alertType: 'info',
        alertTxt: `${recs.length} movies found`,
        airings: recs
      });
    }
  };

  render() {
    const { airings, alertTxt, alertType } = this.state;

    return (
      <>
        {alertTxt ? (
          <Alert className="fade m-2" variant={alertType}>
            {alertTxt}
          </Alert>
        ) : (
          ''
        )}
        {airings.map(rec => {
          return <ShowCover show={rec.show} key={`program-${rec.object_id}`} />;
        })}
      </>
    );
  }
}

export async function programList() {
  const recType = new RegExp('program');
  const recs = await global.RecDb.asyncFind({ path: { $regex: recType } });

  const objRecs = [];

  await asyncForEach(recs, async rec => {
    const airing = await Airing.create(rec);
    objRecs.push(airing);
  });

  const titleSort = (a, b) => {
    if (a.show.sortableTitle > b.show.sortableTitle) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));

  return objRecs;
}
