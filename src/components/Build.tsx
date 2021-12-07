import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { writeToFile } from '../utils/utils';
import getConfig from '../utils/config';

import { dbCreatedKey, recDbCreated, recDbStats } from '../utils/db';

import * as BuildActions from '../store/build';
import { DbSliceState } from '../store/build';

import {
  STATE_WAITING,
  STATE_START,
  STATE_LOADING,
  STATE_FINISH,
  STATE_ERROR,
} from '../constants/app';

import Airing from '../utils/Airing';
import Show from '../utils/Show';
import Channel from '../utils/Channel';

type OwnProps = Record<string, any>;

type StateProps = Record<string, any>;

type DispatchProps = {
  updateProgress: (arg: DbSliceState) => void;
};

type BuildProps = OwnProps & StateProps & DispatchProps;

type State = {
  loading: number;
  log: Array<string>;
  airingInc: number;
  airingMax: number;
  recCount: number;
};

class Build extends Component<BuildProps, State> {
  building: boolean;

  psToken: string;

  static defaultProps = {
    view: 'progress',
  };

  constructor(props: BuildProps) {
    super(props);
    this.state = {
      loading: STATE_WAITING,
      log: [],
      airingInc: 0,
      airingMax: 1,
      recCount: 0,
    };
    this.psToken = '';
    this.building = false;
    this.build = this.build.bind(this);
  }

  async componentDidMount() {
    const { Api } = global;
    let created = recDbCreated();

    // TODO: some const export?
    if (!created) {
      let i = 0;

      const autoBuild = async () => {
        created = recDbCreated();

        if (!Api.device && !created) {
          if (i > 0) return;
          i += 1;
          setTimeout(autoBuild, 5000);
        }

        if (Api.device && !created) this.build();
      };

      autoBuild();
    }
  }

  build = async () => {
    const { Api } = global;
    const { updateProgress } = this.props;

    // return;
    // const { showDbTable } = this.props;
    if (!Api.device) return;

    if (this.building) {
      console.log('trying to double build');
      return;
    }

    if (!global.CONNECTED) {
      console.log('Not connected, not bulding...');
      return;
    }

    if (global.EXPORTING) {
      console.log('Exporting, not bulding...');
      return;
    }

    this.building = true;
    console.time('Building');
    // showDbTable(false);
    this.setState({
      loading: STATE_LOADING,
      log: [],
    });
    updateProgress({
      loading: STATE_LOADING,
      log: [],
    });

    try {
      console.log('start');
      const total = await Api.getRecordingsCount();
      console.log('total', total);
      this.setState({
        airingMax: total,
      });
      updateProgress({
        airingMax: total,
      });

      const recs = await Api.getRecordings(true, (val: number) => {
        this.setState({
          airingInc: val,
        });
        updateProgress({
          airingInc: val,
        });
      });
      // TODO: maybe put this elsewhere later
      recs.forEach((rec: Record<string, any>) => {
        writeToFile(`airing-${rec.object_id}.json`, rec);
      });
      console.log(`retrieved ${recs.length} recordings`);
      const { log } = this.state;
      log.push(`retrieved ${recs.length} recordings`);
      const { RecDb } = global;

      const recRemoveCnt = await RecDb.asyncRemove(
        {},
        {
          multi: true,
        }
      );
      await global.ShowDb.asyncRemove(
        {},
        {
          multi: true,
        }
      );
      await global.ChannelDb.asyncRemove(
        {},
        {
          multi: true,
        }
      );

      console.log(`${recRemoveCnt} old records removed`);
      let insertRes = await RecDb.asyncInsert(recs);
      console.log(`${insertRes.length} records added`);
      log.push(`${insertRes.length} recordings found.`);
      const showPaths: string[] = [];
      recs.forEach((rec: Record<string, any>) => {
        const airing = new Airing(rec);
        writeToFile(`${airing.type}-airing-${airing.id}.json`, rec);

        try {
          if (airing.typePath) showPaths.push(airing.typePath);
        } catch (e) {
          console.log(
            'error pushing airing.typePath into showPaths - skipping'
          );
        }
      });

      /** init shows from recordings for now to "seed" the db */
      const shows = await Api.batch([...new Set(showPaths)]);

      if (getConfig().enableExportData) {
        shows.forEach((rec: Record<string, any>) => {
          const show = new Show(rec);
          writeToFile(`show-${show.object_id}.json`, rec);
        });
      }

      insertRes = await global.ShowDb.asyncInsert(shows);
      console.log(`${insertRes.length} SHOW records added`);

      /** Init all the channels b/c we have no choice. This also isn't much */
      const channelPaths = await Api.get('/guide/channels');
      const channels = await Api.batch([...new Set(channelPaths)]);

      if (getConfig().enableExportData) {
        channels.forEach((rec: Record<string, any>) => {
          const channel = new Channel(rec);
          writeToFile(`channel-${channel.object_id}.json`, rec);
        });
      }

      insertRes = await global.ChannelDb.asyncInsert(channels);
      console.log(`${insertRes.length} CHANNEL records added`);

      /** Finish up... */
      this.building = false;
      await this.setState({
        loading: STATE_FINISH,
        log,
      });
      updateProgress({
        loading: STATE_FINISH,
        log,
      });
      localStorage.setItem(dbCreatedKey(), new Date().toISOString());
      PubSub.publish('DB_CHANGE', true);
      console.timeEnd('Building');
    } catch (e) {
      console.log('Error Building! Resetting...', e);
      console.timeEnd('Building');
      this.building = false;
      let err = 'Unknown error (network?), e object disappeared';

      // e "disappeared"? sentry #1c
      if (e) {
        err = e.toString();
      }

      this.setState({
        loading: STATE_ERROR,
        log: [err],
      });
      updateProgress({
        loading: STATE_ERROR,
        log: [err],
      });
    }
  };

  render() {
    const { progress, updateProgress } = this.props;
    if (progress.loading === STATE_START) {
      updateProgress({
        loading: STATE_LOADING,
      });
      console.log('starting');
      this.build();
    }
    return <></>;
  }
}

const mapStateToProps = (state: any, ownProps: OwnProps) => {
  const { build } = state;
  return {
    progress: build,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(BuildActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Build);
