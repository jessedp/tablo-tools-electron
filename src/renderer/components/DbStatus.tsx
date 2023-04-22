import { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PubSub from 'pubsub-js';

import { Cron } from 'croner';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as BuildActions from '../store/build';

import { recDbCreated } from '../utils/db';

import RelativeDate from './RelativeDate';

import { hasDevice } from '../utils/Tablo';
import DbLoadingSpinner from './DbLoadingSpinner';

type OwnProps = Record<string, never>;

type StateProps = Record<string, any>;

type DispatchProps = {
  startBuild: () => void;
};

type DbStatusProps = OwnProps & DispatchProps;

type State = {
  dbAge: number;
};

class DbStatus extends Component<DbStatusProps, State> {
  timer: NodeJS.Timer;

  psToken: string;

  job: Cron;

  // eslint-disable-next-line
  rerender: Cron;

  constructor(props: DbStatusProps) {
    super(props);
    this.state = {
      dbAge: -1,
    };

    this.timer = setTimeout(() => undefined, 0);

    this.psToken = '';

    // cron syntax that runs 2 minutes and 32 minutes after the hour
    this.job = Cron('2,32 * * * *', { maxRuns: 1 });

    // eslint-disable-next-line
    this.rerender = Cron('* * * * *', {}, () => {
      this.updateTime();
    });

    this.forceBuild = this.forceBuild.bind(this);
  }

  async componentDidMount(): Promise<void> {
    const { startBuild } = this.props;
    const created = recDbCreated();

    // If function is omitted in constructor, it can be scheduled later
    this.job.schedule(() => startBuild());

    if (!created) {
      console.log('DB does not exist, triggering build');
      this.job.trigger();
    }

    this.updateTime();
    this.psToken = PubSub.subscribe('DB_CHANGE', () => this.updateTime());
  }

  componentWillUnmount(): void {
    clearInterval(this.timer);
    PubSub.unsubscribe(this.psToken);
  }

  updateTime = () => {
    const created = recDbCreated();
    const dbTime = new Date(created).getTime();

    const dbAgeInMinutes = (Date.now() - dbTime) / 60 / 1000;
    console.log(`DB age: ${dbAgeInMinutes} minutes`);
    this.setState({ dbAge: dbAgeInMinutes });
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

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(BuildActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(DbStatus);
