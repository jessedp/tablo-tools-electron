import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { writeToFile } from '../utils/utils';
import getConfig from '../utils/config';

import { dbCreatedKey, recDbCreated } from '../utils/db';

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
    const { updateProgress } = this.props;

    if (!window.Tablo.device()) return;

    if (this.building) {
      console.log('trying to double build');
      return;
    }

    if (!window.Tablo.CONNECTED()) {
      console.log('Not connected, not bulding...');
      return;
    }

    if (global.EXPORTING) {
      console.log('Exporting, not bulding...');
      return;
    }

    this.building = true;
    console.time('Building');

    updateProgress({
      loading: STATE_LOADING,
      log: [],
    });

    try {
      console.log('start build');
      const total = await window.Tablo.getRecordingsCount();
      console.log('total', total);

      updateProgress({
        airingMax: total,
      });

      window.electron.ipcRenderer.on(
        'get-recording-progress',
        (message: any) => {
          console.log('progress', message);

          updateProgress({
            airingInc: message,
          });
        }
      );

      const recs = await window.Tablo.getRecordings(true);

      // TODO: maybe put this elsewhere later
      recs.forEach((rec: Record<string, any>) => {
        writeToFile(`airing-${rec.object_id}.json`, rec);
      });
      console.log(`retrieved ${recs.length} recordings`);
      const log = [];
      log.push(`retrieved ${recs.length} recordings`);

      const recRemoveCnt = window.db.asyncRemove(
        'RecDb',
        {},
        {
          multi: true,
        }
      );
      window.db.asyncRemove(
        'ShowDb',
        {},
        {
          multi: true,
        }
      );
      window.db.asyncRemove(
        'ChannelDb',
        {},
        {
          multi: true,
        }
      );

      console.log(`${recRemoveCnt} old records removed`);
      let insertRes = window.db.asyncInsert('RecDb', recs);
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
      const shows = window.Tablo.batch([...new Set(showPaths)]);

      if (getConfig().enableExportData) {
        shows.forEach((rec: Record<string, any>) => {
          const show = new Show(rec);
          writeToFile(`show-${show.object_id}.json`, rec);
        });
      }

      insertRes = window.db.asyncInsert('ShowDb', shows);
      console.log(`${insertRes.length} SHOW records added`);

      /** Init all the channels b/c we have no choice. This also isn't much */
      const channelPaths = window.Tablo.get('/guide/channels');
      const channels = window.Tablo.batch([...new Set(channelPaths)]);

      if (getConfig().enableExportData) {
        channels.forEach((rec: Record<string, any>) => {
          const channel = new Channel(rec);
          writeToFile(`channel-${channel.object_id}.json`, rec);
        });
      }

      insertRes = window.db.asyncInsert('ChannelDb', channels);
      console.log(`${insertRes.length} CHANNEL records added`);

      /** Finish up... */
      this.building = false;
      updateProgress({
        loading: STATE_FINISH,
        log,
      });
      window.electron.store.set(dbCreatedKey(), new Date().toISOString());
      PubSub.publish('DB_CHANGE', true);
      console.timeEnd('Building');
    } catch (e) {
      console.log('Error Building! Resetting...', e);
      console.timeEnd('Building');
      this.building = false;
      let err = 'Unknown error (network?), e object disappeared';

      // e "disappeared"? sentry #1c
      if (e) {
        err = `${e}`;
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

const mapStateToProps = (state: any) => {
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
