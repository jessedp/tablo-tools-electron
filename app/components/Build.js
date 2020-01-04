// @flow
import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Api from '../utils/Tablo';
import { RecDb, ShowDb, recDbCreated, recDbStats } from '../utils/db';

import Airing from '../utils/Airing';
import RelativeDate from './RelativeDate';

type Props = { showDbTable: (show: boolean) => void };
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

export default class Build extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      loading: STATE_NONE,
      status: [],
      airingInc: 0,
      airingMax: 1,
      recCount: 0
    };
    this.build = this.build.bind(this);
  }

  async componentDidMount(): void {
    const total = await recDbStats();
    await this.setState({ recCount: total });
  }

  build = async () => {
    const { showDbTable } = this.props;

    showDbTable(false);

    this.setState({ loading: STATE_LOADING, status: [] });

    const total = await Api.getRecordings({ countOnly: true, force: true });
    this.setState({ airingMax: total });

    const recs = await Api.getRecordings({
      callback: val => {
        this.setState({ airingInc: val });
      }
    });

    console.log(`retrieved ${recs.length} recordings`);
    const { status } = this.state;
    status.push(`retrieved ${recs.length} recordings`);

    let cnt = 0;
    cnt = await RecDb.asyncRemove({}, { multi: true });
    await ShowDb.asyncRemove({}, { multi: true });

    console.log(`${cnt} old records removed`);
    cnt = await RecDb.asyncInsert(recs);
    console.log(`${cnt.length} records added`);
    status.push(`${cnt.length} recordings found.`);

    const showPaths = [];
    recs.forEach(rec => {
      const airing = new Airing(rec);
      showPaths.push(airing.typePath);
    });

    const shows = await Api.batch([...new Set(showPaths)]);

    cnt = await ShowDb.asyncInsert(shows);
    console.log(`${cnt.length} SHOW records added`);

    await this.setState({ loading: STATE_FINISH, status });
    localStorage.setItem('LastDbBuild', new Date().toISOString());
    showDbTable(true);
  };

  loading() {
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
  }

  render() {
    const { loading, recCount } = this.state;
    const { showDbTable } = this.props;

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
        {this.loading()}
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

  // showDbTable(false);

  return (
    <>
      Please load your recordings first.
      <Button onClick={build} className="ml-auto mr-2" size="sm">
        Load
      </Button>
    </>
  );
}
