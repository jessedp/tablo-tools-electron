import { Component } from 'react';

import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';

import PubSub from 'pubsub-js';

import { Cron } from 'croner';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import getConfig from 'renderer/utils/config';
import * as BuildActions from '../store/build';

import { recDbCreated } from '../utils/db';

import RelativeDate from './RelativeDate';

import { hasDevice } from '../utils/Tablo';
import DbLoadingSpinner from './DbLoadingSpinner';

/** BEGIN Redux setup */
const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(BuildActions, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    config: state.config,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
/** END Redux setup */

type OwnProps = Record<string, never>;

// type StateProps = Record<string, any>;

type DispatchProps = {
  startBuild: () => void;
};

type DbStatusProps = OwnProps & DispatchProps & PropsFromRedux;

type State = {
  dbAge: number;
};

class DbStatus extends Component<DbStatusProps, State> {
  psToken: string;

  job: Cron;

  // eslint-disable-next-line
  rerender: Cron;

  constructor(props: DbStatusProps) {
    super(props);
    this.state = {
      dbAge: -1,
    };

    this.psToken = '';

    // cron syntax that runs 2 minutes and 32 minutes after the hour
    this.job = Cron('2,32 * * * *', {
      maxRuns: 1,
      protect: true,
      paused: getConfig().autoRebuild,
    });

    // eslint-disable-next-line
    this.rerender = Cron('0 * * * * *', { protect: true });

    this.forceBuild = this.forceBuild.bind(this);
  }

  componentDidMount(): void {
    const { startBuild } = this.props;
    const created = recDbCreated();

    this.rerender.schedule(() => this.buildIfOutdated());

    // If function is omitted in constructor, it can be scheduled later
    this.job.schedule(() => startBuild());

    if (!getConfig().autoRebuild) {
      this.job.pause();
    }

    if (!created) {
      console.log('DB does not exist, triggering build');
      this.job.trigger();
    } else {
      this.buildIfOutdated();
    }

    this.psToken = PubSub.subscribe('DB_CHANGE', () => this.updateTime());
  }

  componentDidUpdate(prevProps: DbStatusProps) {
    const { config } = this.props;

    if (config.autoRebuild !== prevProps.config.autoRebuild) {
      if (config.autoRebuild) {
        this.buildIfOutdated();
        this.job.resume();
      } else {
        this.job.pause();
      }
    }
  }

  componentWillUnmount(): void {
    this.job.stop();
    this.rerender.stop();
    PubSub.unsubscribe(this.psToken);
  }

  buildIfOutdated = () => {
    const created = recDbCreated();
    const dbAge = this.updateTime();

    const nextRunInMs = this.job.msToNext();
    const nextRunInMinutes = nextRunInMs ? nextRunInMs / 60 / 1000 : 0;

    console.log(`Next scheduled db build in ${nextRunInMinutes} minutes`);
    if (
      getConfig().autoRebuild &&
      created &&
      dbAge >= 5 &&
      nextRunInMinutes >= 2
    ) {
      console.log(
        `DB outdated and next run not for ${nextRunInMinutes}, triggering build`
      );
      this.job.trigger();
    }
  };

  updateTime = () => {
    const created = recDbCreated();
    const dbTime = new Date(created).getTime();

    const dbAgeInMinutes = (Date.now() - dbTime) / 60 / 1000;
    console.log(`DB age: ${dbAgeInMinutes} minutes`);

    this.setState({ dbAge: dbAgeInMinutes });
    return dbAgeInMinutes;
  };

  forceBuild = () => {
    this.job.trigger();
  };

  render() {
    const { dbAge } = this.state;
    if (!hasDevice()) return <></>;
    const created = recDbCreated();

    let color = '';

    if (dbAge === -1) {
      color = 'text-danger';
    } else if (dbAge < 31) {
      color = 'text-success';
    } else if (dbAge < 120) {
      color = 'text-warning';
    } else {
      color = 'text-danger';
    }

    return (
      <div
        className="text-muted"
        style={{
          maxHeight: '16px',
          width: '140px',
        }}
      >
        <Row className="ml-0 mr-0">
          <Col md="2" className="ml-0 pr-0 mr-0 pl-0 btn btn-xs smaller">
            <DbLoadingSpinner />
          </Col>
          <Col md="auto" className="pl-0 ml-0 mr-0 pr-0">
            <div
              style={{
                cursor: 'pointer',
              }}
              onClick={this.forceBuild}
              onKeyDown={() => {}}
              role="button"
              tabIndex={0}
              className="pl-0 btn btn-xs smaller pr-0"
            >
              <span className={`fa fa-database pr-1 ${color}`} />

              <RelativeDate date={created} term="old" />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connector(DbStatus);
