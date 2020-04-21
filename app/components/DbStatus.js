// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { recDbCreated } from '../utils/db';
import Build from './Build';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';

type DbProps = {};
type DbState = { dbAge: number };

export default class DbStatus extends Component<DbProps, DbState> {
  timer: IntervalID;

  // whether we're using short-poll because the db doesn't exit
  shortTimer: boolean;

  emptyPollInterval: number;

  rebuildPollInterval: number;

  autoRebuildInterval: number;

  // TODO: figure out the type.
  buildRef: any;

  psToken: null;

  constructor() {
    super();
    this.state = { dbAge: -1 };
    this.buildRef = React.createRef();
    this.shortTimer = true;
    this.emptyPollInterval = 1000; // 1 second
    this.rebuildPollInterval = 30000; // 30 seconds
    this.autoRebuildInterval = 30; // 30 minutes

    this.forceBuild = this.forceBuild.bind(this);
  }

  async componentDidMount() {
    this.timer = setInterval(this.checkAge, this.emptyPollInterval);
    this.psToken = PubSub.subscribe('DB_CHANGE', () => this.checkAge(false));
    // this.psToken = PubSub.subscribe('DB_BUILT', () => this.checkAge(false));
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    PubSub.unsubscribe(this.psToken);
  }

  checkAge = async (forceBuild?: boolean) => {
    const created = recDbCreated();

    if (!created && !forceBuild) {
      if (!this.shortTimer) {
        clearInterval(this.timer);
        this.timer = setInterval(this.checkAge, this.emptyPollInterval);
      }
      return;
    }

    if (this.shortTimer) {
      this.shortTimer = false;
      clearInterval(this.timer);
      this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    }

    const dbTime = new Date(created).getTime();
    const diff = (Date.now() - dbTime) / 60 / 1000;
    this.setState({ dbAge: diff });

    const config = getConfig();
    let autoRebuild = true;
    if (Object.prototype.hasOwnProperty.call(config, 'autoRebuild')) {
      autoRebuild = config.autoRebuild;
    }

    if ((autoRebuild && diff > this.autoRebuildInterval) || forceBuild) {
      await this.buildRef.build();
      this.checkAge();
    }
  };

  forceBuild = () => {
    this.checkAge(true);
  };

  render() {
    const { dbAge } = this.state;

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
      <div className="text-muted" style={{ maxHeight: '16px' }}>
        <Row>
          <Col md="auto" className="pt-1 pr-0 mr-0">
            <Build
              view="spinner"
              showDbTable={() => {}}
              ref={buildRef => (this.buildRef = buildRef)}
            />
          </Col>
          <Col md="auto" className="pl-0 ml-0">
            <div
              style={{ cursor: 'pointer' }}
              onClick={this.forceBuild}
              onKeyDown={this.forceBuild}
              role="button"
              tabIndex="0"
              className="pl-2"
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
