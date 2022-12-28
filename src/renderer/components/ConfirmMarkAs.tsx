import { Component } from 'react';
import PubSub from 'pubsub-js';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

import * as ActionListActions from '../store/actionList';
import Airing from '../utils/Airing';
import { asyncForEach, throttleActions } from '../utils/utils';
import RecordingMini from './RecordingMini';

import { StdObj } from '../constants/types';
import { EXP_DONE, EXP_WAITING, EXP_WORKING, ON } from '../constants/app';

interface Props extends PropsFromRedux {
  history: any;
}
type State = {
  show: boolean;
  status: number;
  changedCount: number;
  airingList: Airing[];
};

function Progress(props: { changedCount: number; total: number }) {
  const { changedCount, total } = props;

  if (changedCount === total) {
    return (
      <div className="text-center">
        <h2>
          <Badge variant="success">Changed {total} recordings!</Badge>
        </h2>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2>
        <Spinner animation="border" variant="warning" />
        <Badge variant="warning" className="ml-2">
          Changed {changedCount} / {total}
        </Badge>
      </h2>
    </div>
  );
}
class ConfirmMarkAs extends Component<Props & RouteComponentProps, State> {
  shouldCancel: boolean;

  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      show: false,
      status: EXP_WAITING,
      changedCount: 0,
      airingList: [],
    };
    this.shouldCancel = false;
    (this as any).handleShow = this.handleShow.bind(this);
    (this as any).handleClose = this.handleClose.bind(this);
    (this as any).handleMarkRecord = this.handleMarkRecord.bind(this);
    (this as any).updateCount = this.updateCount.bind(this);
  }

  async componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps: Props) {
    const { records } = this.props;

    if (prevProps.records !== records) {
      this.refresh();
    }
  }

  handleClose() {
    // this.shouldCancel = true;
    this.setState({
      status: EXP_WAITING,
      show: false,
    });
  }

  handleShow = () => {
    this.shouldCancel = false;
    this.setState({
      status: EXP_WAITING,
      show: true,
    });
  };

  handleMarkRecord = async (attributeType: string, markRecord: boolean) => {
    const { history, records } = this.props;
    this.setState({
      status: EXP_WORKING,
      changedCount: 0,
    });

    const list: (() => void)[] = []; // Function[]
    await asyncForEach(records, async (rec: StdObj) => {
      const item = await Airing.create(rec);
      list.push(() => {
        if (this.shouldCancel === false) {
          if (attributeType === 'watch') {
            return item.setWatched(markRecord);
          }
          if (attributeType === 'protect') {
            return item.setProtected(markRecord);
          }
        }
        return () => undefined;
      });
    });
    await throttleActions(list, 4, this.updateCount)
      .then(async () => {
        this.setState({ status: EXP_DONE });
        PubSub.publish('DB_CHANGE');

        setTimeout(() => {
          this.handleClose();
          // yuck. this "refreshes" the page with a "white screen"
          history.push('/temp');
          history.goBack();
        }, 1000);
        return true;
      })
      .catch((result) => {
        console.log('markRecord failed', result);
        return false;
      });
  };

  updateCount = (count: number) => {
    const { changedCount } = this.state;
    this.setState({
      changedCount: changedCount + count,
    });
  };

  async refresh() {
    const { records } = this.props;
    const airingList: Airing[] = [];
    await asyncForEach(records, async (rec) => {
      const airing = await Airing.create(rec);
      airingList.push(airing);
    });
    this.setState({ airingList });
  }

  render() {
    const { airingList, show, status, changedCount } = this.state;

    const airings = airingList;

    return (
      <span id={`${Math.floor(Math.random() * 1000000)}`}>
        <div
          onClick={this.handleShow}
          onKeyDown={this.handleShow}
          title="Mark As..."
          tabIndex={0}
          role="button"
          className="confirm-markas-button"
        >
          <span className="fas fa-sliders-h pr-2" />
          Mark as...
        </div>
        <Modal
          size="xl"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Change
              <Badge variant="danger" className="pl-2 ml-1 pr-2 mr-1">
                {airings.length}
              </Badge>
              Recordings?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {status === EXP_WAITING ? (
              <>
                <br />
                {airings.map((item: Airing) => (
                  <RecordingMini
                    withShow={ON}
                    airing={item}
                    doDelete={() => undefined}
                    key={`cfd-mini-${item.object_id}`}
                  />
                ))}
              </>
            ) : (
              ''
            )}
            {status !== EXP_WAITING ? (
              <Progress total={airings.length} changedCount={changedCount} />
            ) : (
              ''
            )}
          </Modal.Body>
          <Modal.Footer>
            {status === EXP_DONE ? (
              <Button variant="secondary" onClick={this.handleClose}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="warning"
                  onClick={() => this.handleMarkRecord('watch', true)}
                >
                  All Watched
                </Button>
                <Button
                  variant="outline-warning"
                  onClick={() => this.handleMarkRecord('watch', false)}
                >
                  All Unwatched
                </Button>
                <Button
                  variant="dark"
                  onClick={() => this.handleMarkRecord('protect', true)}
                >
                  All Protected
                </Button>
                <Button
                  variant="outline-dark"
                  onClick={() => this.handleMarkRecord('protect', false)}
                >
                  All Unprotected
                </Button>
                <Button
                  variant="secondary"
                  onClick={this.handleClose}
                  className="ml-5"
                >
                  Cancel
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ ...ActionListActions }, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    records: state.actionList.records,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(ConfirmMarkAs));
