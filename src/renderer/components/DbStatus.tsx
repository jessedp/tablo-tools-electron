import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PubSub from 'pubsub-js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as BuildActions from '../store/build';
import { DbSliceState } from '../store/build';

import { recDbCreated } from '../utils/db';

import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';
import { hasDevice } from '../utils/Tablo';
import DbLoadingSpinner from './DbLoadingSpinner';
import { StdObj } from '../constants/app';

type OwnProps = Record<string, never>;

type StateProps = {
  build: StdObj;
};

type DispatchProps = {
  startBuild: () => void;
  updateProgress: (arg: DbSliceState) => void;
};

type DbStatusProps = OwnProps & StateProps & DispatchProps;

type State = {
  dbAge: number;
};

class DbStatus extends Component<DbStatusProps, State> {
  // timer: number;
  timer: NodeJS.Timer;
  // timer: ReturnType<typeof setInterval>;

  // whether we're using short-poll because the db doesn't exit
  shortTimer: boolean;

  emptyPollInterval: number;

  rebuildPollInterval: number;

  autoRebuildInterval: number;

  psToken: string;

  constructor(props: DbStatusProps) {
    super(props);
    this.state = {
      dbAge: -1,
    };
    // this.timer = 0;
    this.timer = setTimeout(() => undefined, 0);

    this.psToken = '';

    this.shortTimer = true;
    this.emptyPollInterval = 5000; // 1 second

    this.rebuildPollInterval = 30000; // 30 seconds

    this.autoRebuildInterval = 30; // 30 minutes

    this.forceBuild = this.forceBuild.bind(this);
  }

  async componentDidMount(): Promise<void> {
    const created = recDbCreated();
    if (!created)
      this.timer = setInterval(this.checkAge, this.emptyPollInterval);
    else this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    this.psToken = PubSub.subscribe('DB_CHANGE', () => this.checkAge(false));
  }

  componentWillUnmount(): void {
    clearInterval(this.timer);
    PubSub.unsubscribe(this.psToken);
  }

  checkAge = async (forceBuild?: boolean): Promise<void> => {
    const { startBuild } = this.props;
    const created = recDbCreated();

    if (!created && !forceBuild) {
      // if we're coming back through after 1st build,
      if (!this.shortTimer) {
        clearInterval(this.timer);
        this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
      }

      return;
    }

    if (this.shortTimer) {
      this.shortTimer = false;
      clearInterval(this.timer);
      this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    }
    let diff = 0;
    if (created) {
      const dbTime = new Date(created).getTime();
      diff = (Date.now() - dbTime) / 60 / 1000;
    }

    this.setState({
      dbAge: diff,
    });

    const config = getConfig();
    let autoRebuild = true;

    if (Object.prototype.hasOwnProperty.call(config, 'autoRebuild')) {
      autoRebuild = config.autoRebuild;
    }

    console.log(
      'checkAge() - autoRebuild =',
      autoRebuild,
      'diff (min) =',
      diff,
      'this.autoRebuildInterval (min) =',
      this.autoRebuildInterval
    );
    if ((autoRebuild && diff > this.autoRebuildInterval) || forceBuild) {
      if (window.Tablo.CONNECTED()) startBuild();
      clearInterval(this.timer);
      this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    }
  };

  forceBuild = () => {
    this.checkAge(true);
  };

  render(): JSX.Element {
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
        <Row>
          <Col md="2" className="ml-2 pr-0 mr-0 pl-0 btn btn-xs smaller">
            <DbLoadingSpinner />
          </Col>
          <Col md="auto" className="pl-0 ml-0">
            <div
              style={{
                cursor: 'pointer',
              }}
              onClick={this.forceBuild}
              onKeyDown={this.forceBuild}
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

const mapStateToProps = (state: any) => {
  const { build } = state;
  return {
    build,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(BuildActions, dispatch);
};

// export default connect<any, any>(
export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(DbStatus);
