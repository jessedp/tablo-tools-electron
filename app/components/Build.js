// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { dbCreatedKey, recDbCreated, recDbStats } from '../utils/db';

import Airing from '../utils/Airing';
import RelativeDate from './RelativeDate';
import { writeToFile } from '../utils/utils';
import getConfig from '../utils/config';
import Show from '../utils/Show';
import Channel from '../utils/Channel';

type Props = { showDbTable: (show: boolean) => void, view?: string };
type State = {
  loading: number,
  status: Array<Object>,
  airingInc: number,
  airingMax: number,
  recCount: number
};

const STATE_NONE = 0;
const STATE_LOADING = 1;
const STATE_FINISH = 2;
const STATE_ERROR = 3;

export default class Build extends Component<Props, State> {
  props: Props;

  building: boolean;

  psToken: null;

  static defaultProps = { view: 'progress' };

  constructor() {
    super();
    this.state = {
      loading: STATE_NONE,
      status: [],
      airingInc: 0,
      airingMax: 1,
      recCount: 0
    };
    this.building = false;
    this.build = this.build.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount(): * {
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
          setTimeout(await autoBuild, 5000);
        }
        if (Api.device && !created) this.build();
      };
      autoBuild();
    }
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    const total = await recDbStats();
    await this.setState({ recCount: total });
  };

  build = async () => {
    const { Api } = global;
    const { showDbTable } = this.props;

    if (!Api.device) return;
    if (this.building) {
      console.log('trying to double build');
      return;
    }
    if (!global.CONNECTED) {
      console.log('Not connected, not bulding...');
      return;
    }

    this.building = true;
    console.time('Building');

    showDbTable(false);

    this.setState({ loading: STATE_LOADING, status: [] });

    try {
      console.log('start');
      const total = await Api.getRecordingsCount();
      console.log('total', total);
      this.setState({ airingMax: total });

      const recs = await Api.getRecordings(true, val => {
        this.setState({ airingInc: val });
      });

      // TODO: maybe put this elsewhere later
      recs.forEach(rec => {
        writeToFile(`airing-${rec.object_id}.json`, rec);
      });

      console.log(`retrieved ${recs.length} recordings`);
      const { status } = this.state;
      status.push(`retrieved ${recs.length} recordings`);

      const { RecDb } = global;
      let cnt = 0;
      cnt = await RecDb.asyncRemove({}, { multi: true });
      await global.ShowDb.asyncRemove({}, { multi: true });
      await global.ChannelDb.asyncRemove({}, { multi: true });

      console.log(`${cnt} old records removed`);
      cnt = await RecDb.asyncInsert(recs);
      console.log(`${cnt.length} records added`);
      status.push(`${cnt.length} recordings found.`);

      const showPaths = [];
      recs.forEach(rec => {
        const airing = new Airing(rec);
        writeToFile(`airing-${airing.object_id}.json`, rec);
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
        shows.forEach(rec => {
          const show = new Show(rec);
          writeToFile(`show-${show.object_id}.json`, rec);
        });
      }

      cnt = await global.ShowDb.asyncInsert(shows);
      console.log(`${cnt.length} SHOW records added`);

      /** Init all the channels b/c we have no choice. This also isn't much */
      const channelPaths = await Api.get('/guide/channels');

      const channels = await Api.batch([...new Set(channelPaths)]);
      if (getConfig().enableExportData) {
        channels.forEach(rec => {
          const channel = new Channel(rec);
          writeToFile(`channel-${channel.object_id}.json`, rec);
        });
      }

      cnt = await global.ChannelDb.asyncInsert(channels);
      console.log(`${cnt.length} CHANNEL records added`);

      /** Finish up... */
      this.building = false;
      await this.setState({
        loading: STATE_FINISH,
        status
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
      await this.setState({
        loading: STATE_ERROR,
        status: [err]
      });
    }

    showDbTable(true);
  };

  loadingProgress() {
    const { loading, status, airingMax, airingInc } = this.state;

    if (loading === STATE_NONE) {
      return '';
    }

    let progressVariant = 'info';

    if (loading === STATE_LOADING) {
      const pct = Math.round((airingInc / airingMax) * 100);
      // console.log('loading pct', pct);
      const airingPct = `${pct}%`;
      if (pct < 25) {
        progressVariant = 'danger';
      } else if (pct < 50) {
        progressVariant = 'warning';
      } else if (pct < 75) {
        progressVariant = 'info';
      } else {
        progressVariant = 'success';
      }

      return (
        <Container>
          <h6 className="p-3">Finding Recordings...</h6>
          <ProgressBar
            animated
            max={airingMax}
            now={airingInc}
            label={airingPct}
            variant={progressVariant}
          />
          {airingInc === airingMax ? (
            <div>
              <h6 className="p-3">Finishing up...</h6>
              <div className="pl-5 pt-1">
                {' '}
                <Spinner animation="grow" variant="primary" />
              </div>
            </div>
          ) : (
            ''
          )}
        </Container>
      );
    }
    if (loading === STATE_FINISH) {
      setTimeout(() => {
        this.setState({ loading: STATE_NONE });
      }, 3000);

      const txt = status.pop();
      return (
        <Container>
          <Alert className="fade m-2" variant="success">
            Done! {txt}
          </Alert>
        </Container>
      );
    }

    if (loading === STATE_ERROR) {
      setTimeout(() => {
        this.setState({ loading: STATE_NONE });
      }, 5000);

      return (
        <Container>
          <Alert className="fade m-2" variant="danger">
            <b>Problem building...</b>
            <br />
            {status[0]}
          </Alert>
        </Container>
      );
    }
  }

  loadingSpinner() {
    const { loading, airingMax, airingInc } = this.state;

    if (loading === STATE_NONE) {
      return '';
    }

    let progressVariant = 'badge-danger';

    if (loading === STATE_LOADING) {
      const pct = Math.round((airingInc / airingMax) * 100);
      // console.log('loading pct', pct);
      // const airingPct = `${pct}%`;
      if (pct < 25) {
        progressVariant = 'badge-danger';
      } else if (pct < 50) {
        progressVariant = 'badge-warning';
      } else if (pct < 75) {
        progressVariant = 'badge-info';
      } else {
        progressVariant = 'badge-success';
      }
      const cubeClass = `sk-folding-cube ${progressVariant}`;

      return (
        <div className={cubeClass}>
          <div className="sk-cube1 sk-cube" />
          <div className="sk-cube2 sk-cube" />
          <div className="sk-cube4 sk-cube" />
          <div className="sk-cube3 sk-cube" />
        </div>
      );
    }
    if (loading === STATE_FINISH) {
      return <></>;
    }
  }

  render() {
    const { loading, recCount } = this.state;
    const { showDbTable, view } = this.props;

    if (view === 'spinner') {
      return <>{this.loadingSpinner()}</>;
    }
    // progress
    return (
      <Container>
        <Row>
          <Col className="d-flex align-items-center">
            {loading !== STATE_LOADING ? (
              <BuildTitle
                recCount={recCount}
                showDbTable={showDbTable}
                build={this.build}
              />
            ) : (
              ''
            )}
          </Col>
        </Row>
        {this.loadingProgress()}
      </Container>
    );
  }
}

function BuildTitle(prop) {
  const { build, recCount } = prop;

  if (recCount) {
    return (
      <>
        <span>
          Last checked: <RelativeDate date={recDbCreated()} />
        </span>
        <Button onClick={build} className="ml-auto mr-2" size="sm">
          Reload
        </Button>
      </>
    );
  }

  return (
    <>
      Please load your recordings first.
      <Button onClick={build} className="ml-auto mr-2" size="sm">
        Load
      </Button>
    </>
  );
}
