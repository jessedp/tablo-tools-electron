// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import { Alert, Row } from 'react-bootstrap';
import Airing from '../utils/Airing';
import { asyncForEach } from '../utils/utils';
import ProgramCover from './ProgramCover';
import { ProgramData, YES } from '../constants/app';
import ProgramEpisodeList from './ProgramEpisodeList';

type Props = {};
type State = {
  airings: Array<any>,
  alertType: string,
  alertTxt: string,
  programPath: string
};

export default class Programs extends Component<Props, State> {
  props: Props;

  initialState: State;

  psToken: null;

  constructor() {
    super();

    this.state = { airings: [], alertType: '', alertTxt: '', programPath: '' };

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

  search = async (path: string = '') => {
    let recs = [];

    if (path) {
      recs = await programList();
    } else {
      recs = await programList();
    }

    if (recs.length === 0) {
      this.setState({
        programPath: path,
        alertType: 'warning',
        alertTxt: 'No manual recordings found',
        airings: []
      });
    } else {
      this.setState({
        programPath: path,
        alertType: 'info',
        alertTxt: `${recs.length} manual recordings found`,
        airings: recs
      });
    }
  };

  render() {
    const { airings, alertTxt, alertType, programPath } = this.state;

    if (programPath) {
      const recs: ProgramData = airings.find(
        rec => rec.airing.program_path === programPath
      );
      console.log(programPath, recs);
      return <ProgramEpisodeList rec={recs} search={this.search} />;
    }
    return (
      <div className="section">
        {alertTxt ? (
          <Alert className="fade m-2" variant={alertType}>
            {alertTxt}
          </Alert>
        ) : (
          ''
        )}
        <Row>
          {airings.map(rec => {
            return (
              <ProgramCover
                rec={rec}
                showCheckbox={YES}
                search={this.search}
                key={`program-${rec.airing.object_id}`}
              />
            );
          })}
        </Row>
      </div>
    );
  }
}

export async function programList() {
  const recType = new RegExp('program');
  const recs = await global.RecDb.asyncFind({ path: { $regex: recType } });

  const objs: any = {};

  const newRecs = [];

  await await asyncForEach(recs, async rec => {
    const airing = await Airing.create(rec);
    newRecs.push(airing);
  });

  newRecs.forEach(rec => {
    const path = rec.program_path.trim();

    if (Object.prototype.hasOwnProperty.call(objs, path)) {
      objs[path].count += 1;
      if (!rec.userInfo.watched) {
        objs[rec.program_path].unwatched += 1;
      }
      objs[rec.program_path].airings.push(rec);
    } else {
      const airings = [rec];
      objs[path] = {
        airing: rec,
        airings,
        count: 1,
        unwatched: rec.userInfo.watched ? 0 : 1
      };
    }
  });
  const objRecs: ProgramData = Object.keys(objs).map(id => objs[id]);

  const titleSort = (a, b) => {
    if (a.airing.title > b.airing.title) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));
  console.log(objRecs);
  return objRecs;
}

export async function programsByProgramList(path: string) {
  const recs = await global.RecDb.asyncFind({ program_path: { $eq: path } });

  const objRecs = [];

  await asyncForEach(recs, async rec => {
    const airing = await Airing.create(rec);
    objRecs.push(airing);
  });

  const titleSort = (a, b) => {
    if (a.datetime > b.datetime) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));

  return objRecs;
}
